import crypto from 'node:crypto'
import os from 'node:os'

import Axios, { AxiosInstance } from 'axios'

import {
  UpdateJson,
  CheckUpdate,
  GetAppUpdateJson,
  GetNotice,
  GetPrivateVariable,
  GetToken,
  Heartbeat,
  Login,
  Recharge,
  Register,
  Unbind,
  GetUserInfo,
  GetUserIp,
  UserReduceMoney,
  UserReduceVipNumber,
  UserReduceVipTime,
  GetVipData,
  GetAppHomeUrl,
  SetAppUserKey,
  GetCaptcha,
  GetSmsCaptcha,
  GetAppUserKey,
  GetIsUser,
  SetUserQqEmailPhone,
  GetAppInfo,
  GetSystemTime,
  GetAppUserNote,
  GetAppUserVipTime,
  GetUserRmb,
  GetAppUserVipNumber,
  GetCaptchaApiList,
  ApiResponse,
  GetTab,
  PayMoneyToVipNumber,
  GetPayKaList,
  PayMoneyToKa,
  GetPurchasedKaList,
  GetUserClassList,
  SetUserClass,
  RunJS,
  TaskPoolNewData,
  TaskPoolGetData,
  TaskPoolGetTask,
  PayKaUsa,
  GetPayOrderStatus,
  GetUserConfig,
} from './types'
import Result from './result'
import Validator from './validtor'
import Api from './api'

/**
 * 安全数据包结构
 */
interface SecurityPackage {
  /** 加密后的数据体 (Base64) */
  a: string
  /** 签名或加密后的密钥 (MD5 或 RSA 加密后的 AES 密钥) */
  b: string
}

/**
 * 心跳异常类
 */
class HeartbeatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HeartbeatError'
  }
}

const logger = console

/** 当前版本号 */
const version = '2.0.0'
/** API 基础地址 */
const baseUrl = 'http://45.152.65.62:18888'

/** 应用 ID */
const appId = `10014`
/** RSA 公钥，用于加密 AES 密钥 */
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDiFa/za2u1e+n493GsqtK8xBF0
B7e7Lc+rc4HZP2qSvdLgfV5bka/RAy2buCGqmQULD5tVaLUVMRZQlRY7AEZBBk7+
WJnISAJ/37km+iw3HwQE48marcg8TqaHcNvmdWYVE4IzoQPeG8pX/Ch2zo9IbQqM
mQ19VnTkuZivOwH7HQIDAQAB
-----END PUBLIC KEY-----`

/**
 * 验证类：处理与后端的加密通信、登录、心跳等逻辑
 */
class _Verify {
  private static readonly instance: _Verify = new _Verify()
  private static readonly appId: string = appId
  /** 静态设备指纹 */
  private static readonly DEVICE_HASH = _Verify.buildDeviceHash()
  /** 心跳间隔时间 (45秒) */
  private static readonly HEARTBEAT_INTERVAL = 120 * 1000
  /** AES CBC 模式的初始向量 (全0) */
  private static readonly IV = Buffer.alloc(16, 0)
  /** 最大连续心跳失败次数 */
  private static readonly MAX_HEARTBEAT_FAILED_COUNT = 3
  private static readonly publicKey: string = publicKey
  /** 默认状态码 */
  private static readonly STATE = 10000
  /** HTTP 请求超时时间 (15秒) */
  private static readonly TIME_LIMIT = 15 * 1000
  /** 心跳定时器 */
  private static timer: NodeJS.Timeout | null = null

  // 外部可访问的公开变量
  author: string | null = null
  group: string | null = null
  repo: string | null = null
  shop: string | null = null
  notice: string | null = null
  needUpdate: boolean | null = null
  updateJson: UpdateJson | null = null

  private heartbeatFailedCount = 0
  private readonly http: AxiosInstance = Axios.create({
    baseURL: baseUrl,
    timeout: _Verify.TIME_LIMIT
  })
  
  private initialAesKey: Buffer = crypto.randomBytes(24)
  /** 服务器返回的正式 AES 密钥 */
  private serverAesKey: Buffer | null = null
  /** 服务器返回的正式 AES 密钥字符串 (用于 MD5 验签) */
  private serverAesKeyStr: string | null = null

  /** 验证码信息 */
  private captchaInfo: { id: string; type: number; value: string } | null = null

  /**
   * 生成设备唯一指纹
   * 基于 CPU、内存、主机名等硬件信息生成 SHA256 哈希
   */
  private static buildDeviceHash(): string {
    const machineInfo = [
      os.arch(),
      os.platform(),
      os.cpus().map((cpu) => cpu.model).join(''),
      os.totalmem(),
      os.hostname()
    ].join('|')
    return crypto.createHash('sha256').update(machineInfo).digest('hex')
  }

  /**
   * 获取单例实例
   */
  static get to(): _Verify {
    return this.instance
  }

  private constructor() {}

  /**
   * AES 解密 (AES-192-CBC)
   * @param key 密钥
   * @param data Base64 格式的加密数据
   */
  private aesDecrypt({ key, data }: { key: Buffer; data: string }): string {
    try {
      const decipher = crypto.createDecipheriv('aes-192-cbc', key, _Verify.IV)
      let decrypted = decipher.update(data, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (e) {
      throw new Error(`AES 解密失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  /**
   * AES 加密 (AES-192-CBC)
   * @param key 密钥
   * @param data 要加密的对象
   */
  private aesEncrypt({ key, data }: { key: Buffer; data: Record<string, unknown> }): string {
    try {
      const cipher = crypto.createCipheriv('aes-192-cbc', key, _Verify.IV)
      let aesEncrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64')
      aesEncrypted += cipher.final('base64')
      return aesEncrypted
    } catch (e) {
      throw new Error(`AES 加密失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  /**
   * 构建请求数据基础结构
   * 添加时间戳和状态码
   */
  private buildData(data: Record<string, unknown>): Record<string, unknown> {
    const baseData: Record<string, unknown> = {
      Time: Math.floor(Date.now() / 1000),
      Status: _Verify.STATE,
      ...data
    }

    if (this.captchaInfo) {
      baseData.Captcha = {
        Id: this.captchaInfo.id,
        Type: this.captchaInfo.type,
        Value: this.captchaInfo.value
      }
      this.captchaInfo = null // 使用后清除
    }

    return baseData
  }

  /**
   * 检查应用更新
   */
  async checkUpdate() {
    const res = await this.request<CheckUpdate>({
      Api: Api.GetAppVersion,
      Version: version,
      IsVersionAll: true
    })
    if (res.success) {
      this.needUpdate = res.data?.Data?.IsUpdate ?? false
    }    
    return res
  }

  /**
   * 解密后端返回的安全数据包
   * 1. 如果 b 是 MD5，说明使用了现有的 AES 密钥加密，需进行 MD5 校验
   * 2. 如果 b 是 Base64，说明需要通过 RSA 解密获取新的 AES 密钥
   */
  private decrypt(data: SecurityPackage): Record<string, unknown> {
    if (Validator.isMd5(data.b)) {
      if (!this.isMd5Equal(data)) {
        throw new Error('响应签名校验失败 (MD5 mismatch)')
      }
      const aesDecrypted = this.aesDecrypt({
        key: this.serverAesKey ?? this.initialAesKey,
        data: data.a
      })
      return JSON.parse(aesDecrypted)
    } else {
      // RSA 解密获取 AES 密钥
      const rsaDecrypted = this.rsaDecrypt(data.b)
      const aesDecrypted = this.aesDecrypt({ key: rsaDecrypted, data: data.a })
      return JSON.parse(aesDecrypted)
    }
  }

  /**
   * 加密请求数据为安全数据包
   * 1. 使用 AES 加密请求体
   * 2. 使用 RSA 加密当前的 AES 密钥
   */
  private encrypt(data: Record<string, unknown>): SecurityPackage {
    const key = this.serverAesKey ?? this.initialAesKey
    const aesEncrypted = this.aesEncrypt({ key, data })
    const rsaEncrypted = this.rsaEncrypt(key)
    return {
      a: aesEncrypted,
      b: rsaEncrypted
    }
  }

  /**
   * 获取应用更新配置 JSON
   */
  async getAppUpdateJson() {
    const res = await this.request<GetAppUpdateJson>({
      Api: Api.GetAppUpDataJson
    })
    if (res.success && res.data?.Data?.AppUpDataJson) {
      try {
        this.updateJson = JSON.parse(res.data.Data.AppUpDataJson)
      } catch (e) {
        logger.error('解析更新配置失败', e)
      }
    }
    return this.updateJson
  }

  /**
   * 获取公告内容
   */
  async getNotice() {
    const res = await this.request<GetNotice>({
      Api: Api.GetAppGongGao
    })
    if (res.success) {
      this.notice = res.data?.Data?.AppGongGao ?? null
    }
    return res
  }

  /**
   * 获取私有变量
   */
  async getPrivateVariable(variable: string) {
    return await this.request<GetPrivateVariable>({
      Api: Api.GetAppPublicData,
      Name: variable
    })
  }

  /**
   * 获取初始 Token 和 AES 密钥
   */
  async getToken() {
    const res = await this.request<GetToken>({ Api: Api.GetToken })
    if (res.success && res.data?.Data?.Token) {
      const cryptoKey = res.data.Data.CryptoKeyAes!
      this.serverAesKeyStr = cryptoKey
      this.serverAesKey = Buffer.from(cryptoKey)
      this.http.defaults.headers.common['Token'] = res.data.Data.Token
    }
    return res
  }

  /**
   * 发送心跳请求
   * 连续失败超过阈值会抛出 HeartbeatError
   */
  async heartbeat() {
    const res = await this.request<Heartbeat>({ Api: Api.HeartBeat })
    if (res.success) {
      this.heartbeatFailedCount = 0
    } else {
      this.heartbeatFailedCount++
      if (this.heartbeatFailedCount >= _Verify.MAX_HEARTBEAT_FAILED_COUNT) {
        //清空 Token
        this.http.defaults.headers.common['Token'] = ''
        this.serverAesKey = null
        this.serverAesKeyStr = null
        
        throw new HeartbeatError('心跳失败次数超过最大允许值')
      }
    }
    return res
  }

  /**
   * 初始化验证系统
   * 1. 获取 Token
   * 2. 启动心跳定时器
   */
  async init() {
    if (_Verify.timer) {
      clearInterval(_Verify.timer)
      _Verify.timer = null
    }

    // 重置状态
    this.http.defaults.headers.common['Token'] = ''
    this.serverAesKey = null
    this.serverAesKeyStr = null
    
    const res = await this.getToken()
    if (!res.success) return res

    // 启动心跳
    _Verify.timer = setInterval(() => {
      this.heartbeat().catch(err => {
        logger.error('心跳定时器执行失败:', err.message)
      })
    }, _Verify.HEARTBEAT_INTERVAL)

    return res
  }

  /**
   * MD5 签名校验
   * 生成本地 MD5 与返回包中的 b 字段比对
   */
  private isMd5Equal(data: SecurityPackage) {
    if (!this.serverAesKeyStr) return false
    const str = `${data.a}${this.serverAesKeyStr}`
    const md5 = crypto.createHash('md5').update(str).digest('hex')
    return md5.toUpperCase() === data.b.toUpperCase()
  }

  /**
   * 类型守卫：判断是否为合法的 SecurityPackage
   */
  private isSecurityPackage(data: unknown): data is SecurityPackage {
    return (
      typeof data === 'object' &&
      data !== null &&
      'a' in data &&
      'b' in data &&
      typeof (data as any).a === 'string' &&
      typeof (data as any).b === 'string'
    )
  }

  /**
   * 用户登录
   */
  async login(username: string, password: string) {
    // 登录前先检查是否有Token，没有token则先初始化Token
    if (!this.http.defaults.headers.common['Token']) {
      await this.init()
    }
    return await this.request<Login>({
      Api: Api.UserLogin,
      UserOrKa: username,
      PassWord: password,
      Key: _Verify.DEVICE_HASH,
      AppVer: version
    })
  }

  /**
   * 获取用户 IP
   */
  async getUserIp() {
    return await this.request<GetUserIp>({
      Api: Api.GetUserIP
    })
  }

  /**
   * 用户减少余额
   */
  async userReduceMoney(money: number, agentMoney: number = 0) {
    return await this.request<UserReduceMoney>({
      Api: Api.UserReduceMoney,
      Money: money,
      AgentMoney: agentMoney
    })
  }

  /**
   * 用户减少积分
   */
  async userReduceVipNumber(vipNumber: number) {
    return await this.request<UserReduceVipNumber>({
      Api: Api.UserReduceVipNumber,
      VipNumber: vipNumber
    })
  }

  /**
   * 用户减少点数
   */
  async userReduceVipTime(vipTime: number) {
    return await this.request<UserReduceVipTime>({
      Api: Api.UserReduceVipTime,
      VipTime: vipTime
    })
  }

  /**
   * 取服务器连接状态
   */
  async isServerLink() {
    return await this.request<ApiResponse>({
      Api: Api.IsServerLink
    })
  }

  /**
   * 取登录状态
   */
  async isLogin() {
    return await this.request<ApiResponse>({
      Api: Api.IsLogin
    })
  }

  /**
   * 取应用 Vip 数据
   */
  async getVipData() {
    return await this.request<GetVipData>({
      Api: Api.GetVipData
    })
  }

  /**
   * 取应用主页 Url
   */
  async getAppHomeUrl() {
    return await this.request<GetAppHomeUrl>({
      Api: Api.GetAppHomeUrl
    })
  }

  /**
   * 置新绑定信息
   */
  async setAppUserKey(newKey: string, user: string = '', password: string = '') {
    return await this.request<SetAppUserKey>({
      Api: Api.SetAppUserKey,
      NewKey: newKey,
      User: user,
      PassWord: password
    })
  }

  /**
   * 置新用户消息
   */
  async setNewUserMsg(msgType: string, msg: string) {
    return await this.request<ApiResponse>({
      Api: Api.SetNewUserMsg,
      MsgType: msgType,
      Msg: msg
    })
  }

  /**
   * 获取验证码
   */
  async getCaptcha(captchaType: number = 1) {
    return await this.request<GetCaptcha>({
      Api: Api.GetCaptcha,
      CaptchaType: captchaType
    })
  }

  /**
   * 获取短信验证码
   */
  async getSmsCaptcha(phone: string = '', user: string = '') {
    return await this.request<GetSmsCaptcha>({
      Api: Api.GetSMSCaptcha,
      Phone: phone,
      User: user
    })
  }

  /**
   * 提交验证码 (缓存在本地，下次请求自动携带)
   */
  submitCaptcha(id: string, type: number, value: string) {
    if (id !== '' && type > 0 && value !== '') {
      this.captchaInfo = { id, type, value }
    }
    return Result.success(null)
  }

  /**
   * 取绑定信息
   */
  async getAppUserKey() {
    return await this.request<GetAppUserKey>({
      Api: Api.GetAppUserKey
    })
  }

  /**
   * 获取用户是否存在
   */
  async getIsUser(_user: string) {
    return await this.request<GetIsUser>({
      Api: Api.GetAppUserKey, 
    })
  }

  /**
   * 取软件用户信息
   */
  async getAppUserInfo() {
    return await this.request<GetUserInfo>({
      Api: Api.GetAppUserInfo
    })
  }

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    return await this.request<GetUserInfo>({
      Api: Api.GetUserInfo
    })
  }

  /**
   * 置用户基础信息
   */
  async setUserQqEmailPhone(email: string = '', phone: string = '', qq: string = '') {
    return await this.request<SetUserQqEmailPhone>({
      Api: Api.SetUserQqEmailPhone,
      Email: email,
      Phone: phone,
      Qq: qq
    })
  }

  /**
   * 取应用基础信息
   */
  async getAppInfo() {
    return await this.request<GetAppInfo>({
      Api: Api.GetAppInfo
    })
  }

  /**
   * 取系统时间戳
   */
  async getSystemTime() {
    return await this.request<GetSystemTime>({
      Api: Api.GetSystemTime
    })
  }

  /**
   * 取软件用户备注
   */
  async getAppUserNote() {
    return await this.request<GetAppUserNote>({
      Api: Api.GetAppUserNote
    })
  }

  /**
   * 取会员到期时间戳或点数
   */
  async getAppUserVipTime() {
    return await this.request<GetAppUserVipTime>({
      Api: Api.GetAppUserVipTime
    })
  }

  /**
   * 用户登录注销
   */
  async logout() {
    return await this.request<ApiResponse>({
      Api: Api.LogOut
    })
  }

  /**
   * 用户登录注销_远程
   */
  async remoteLogout(user: string | number, password: string | number = '') {
    return await this.request<ApiResponse>({
      Api: Api.RemoteLogOut,
      User: user,
      PassWord: password
    })
  }

  /**
   * 密码找回或修改_超级密码
   */
  async setPasswordSuper(user: string, newPassWord: string, superPassWord: string) {
    return await this.request<ApiResponse>({
      Api: Api.SetPassWord,
      Type: 1,
      User: user,
      NewPassWord: newPassWord,
      SuperPassWord: superPassWord
    })
  }

  /**
   * 密码找回或修改_绑定手机
   */
  async setPasswordPhone(user: string, newPassWord: string, phoneCaptchaId: string, phoneCaptchaValue: string) {
    return await this.request<ApiResponse>({
      Api: Api.SetPassWord,
      Type: 2,
      User: user,
      NewPassWord: newPassWord,
      PhoneCaptchaId: phoneCaptchaId,
      PhoneCaptchaValue: phoneCaptchaValue
    })
  }

  /**
   * 取用户余额
   */
  async getUserRmb() {
    return await this.request<GetUserRmb>({
      Api: Api.GetUserRmb
    })
  }

  /**
   * 取用户积分
   */
  async getAppUserVipNumber() {
    return await this.request<GetAppUserVipNumber>({
      Api: Api.GetAppUserVipNumber
    })
  }

  /**
   * 取开启验证码接口列表
   */
  async getCaptchaApiList() {
    return await this.request<GetCaptchaApiList>({
      Api: Api.GetCaptchaApiList
    })
  }

  /**
   * 取动态标记
   */
  async getTab() {
    return await this.request<GetTab>({
      Api: Api.GetTab
    })
  }

  /**
   * 置动态标记
   */
  async setTab(tab: string = '') {
    return await this.request<ApiResponse>({
      Api: Api.SetTab,
      Tab: tab
    })
  }

  /**
   * 余额充值_取支付通道状态
   */
  async getPayStatus() {
    return await this.request<ApiResponse>({
      Api: Api.GetPayStatus
    })
  }

  /**
   * 余额购买积分
   */
  async payMoneyToVipNumber(money: number = 0) {
    return await this.request<PayMoneyToVipNumber>({
      Api: Api.PayMoneyToVipNumber,
      Money: money
    })
  }

  /**
   * 取可购买卡类列表
   */
  async getPayKaList() {
    return await this.request<GetPayKaList>({
      Api: Api.GetPayKaList
    })
  }

  /**
   * 余额购买充值卡
   */
  async payMoneyToKa(kaClassId: number = 0) {
    return await this.request<PayMoneyToKa>({
      Api: Api.PayMoneyToKa,
      KaClassId: kaClassId
    })
  }

  /**
   * 取已购买卡号列表
   */
  async getPurchasedKaList(number: number = 0) {
    return await this.request<GetPurchasedKaList>({
      Api: Api.GetPurchasedKaList,
      Number: number
    })
  }

  /**
   * 取用户类型列表
   */
  async getUserClassList() {
    return await this.request<GetUserClassList>({
      Api: Api.GetUserClassList
    })
  }

  /**
   * 置用户类型
   */
  async setUserClass(mark: number = 0) {
    return await this.request<SetUserClass>({
      Api: Api.SetUserClass,
      Mark: mark
    })
  }

  /**
   * 公共 js 函数运行
   */
  async runJS(jsName: string = '', parameter: string = '', isGlobal: boolean = false) {
    return await this.request<RunJS>({
      Api: Api.RunJS,
      JsName: jsName,
      Parameter: parameter,
      IsGlobal: isGlobal
    })
  }

  /**
   * 任务池_任务创建
   */
  async taskPoolNewData(taskTypeId: string = '', parameter: string = '') {
    return await this.request<TaskPoolNewData>({
      Api: Api.TaskPoolNewData,
      TaskTypeId: taskTypeId,
      Parameter: parameter
    })
  }

  /**
   * 任务池_任务查询
   */
  async taskPoolGetData(taskUuid: string = '') {
    return await this.request<TaskPoolGetData>({
      Api: Api.TaskPoolGetData,
      TaskUuid: taskUuid
    })
  }

  /**
   * 任务池_任务处理获取
   */
  async taskPoolGetTask(getTaskNumber: string = '') {
    return await this.request<TaskPoolGetTask>({
      Api: Api.TaskPoolGetTask,
      GetTaskNumber: getTaskNumber
    })
  }

  /**
   * 任务池_任务处理返回
   */
  async taskPoolSetTask(taskUuid: string = '', taskStatus: number = 0, taskReturnData: string = '') {
    return await this.request<ApiResponse>({
      Api: Api.TaskPoolSetTask,
      TaskUuid: taskUuid,
      TaskStatus: taskStatus,
      TaskReturnData: taskReturnData
    })
  }

  /**
   * 订单_购卡直冲
   */
  async payKaUsa(user: string = '', kaClassId: number = 0, payType: string = '') {
    return await this.request<PayKaUsa>({
      Api: Api.PayKaUsa,
      User: user,
      KaClassId: kaClassId,
      PayType: payType
    })
  }

  /**
   * 订单_支付购卡
   */
  async payGetKa(kaClassId: number = 0, payType: string = '') {
    return await this.request<PayKaUsa>({
      Api: Api.PayGetKa,
      KaClassId: kaClassId,
      PayType: payType
    })
  }

  /**
   * 订单_购买余额
   */
  async payUserMoney(user: string = '', money: number = 0, payType: string = '') {
    return await this.request<PayKaUsa>({
      Api: Api.PayUserMoney,
      User: user,
      Money: money,
      PayType: payType
    })
  }

  /**
   * 订单_购买积分
   */
  async payUserVipNumber(user: string = '', money: number = 0, payType: string = '') {
    return await this.request<PayKaUsa>({
      Api: Api.PayUserVipNumber,
      User: user,
      Money: money,
      PayType: payType
    })
  }

  /**
   * 订单_查询支付结果
   */
  async getPayOrderStatus(orderId: string = '') {
    return await this.request<GetPayOrderStatus>({
      Api: Api.GetPayOrderStatus,
      OrderId: orderId
    })
  }

  /**
   * 用户云配置_置值
   */
  async setUserConfig(name: string = '', value: string = '') {
    return await this.request<ApiResponse>({
      Api: Api.SetUserConfig,
      Name: name,
      Value: value
    })
  }

  /**
   * 用户云配置_取值
   */
  async getUserConfig(name: string = '') {
    return await this.request<GetUserConfig>({
      Api: Api.GetUserConfig,
      Name: name
    })
  }

  /**
   * 卡密充值/激活
   */
  async recharge(username: string, cdKey: string) {
    return this.request<Recharge>({
      Api: Api.UseKa,
      User: username,
      Ka: cdKey
    })
  }

  /**
   * 刷新 Token
   */
  async refreshToken() {
    this.http.defaults.headers.common['Token'] = undefined
    return await this.getToken()
  }

  /**
   * 用户注册
   */
  async register(username: string, password: string) {
    return await this.request<Register>({
      Api: Api.NewUserInfo,
      User: username,
      PassWord: password,
      Key: _Verify.DEVICE_HASH
    })
  }

  /**
   * 核心请求方法：处理加密、发送、解密
   */
  private async request<T>(data: Record<string, unknown>): Promise<Result<T>> {
    try {
      // 1. 构建并加密数据
      const formattedData = this.buildData(data)
      const encrypted = this.encrypt(formattedData)

      // 2. 发送请求
      const { data: res } = await this.http.post<SecurityPackage>(
        `/Api?AppId=${_Verify.appId}`,
        encrypted
      )

      // 3. 校验返回包结构
      if (!this.isSecurityPackage(res)) {
        return Result.failure(`后端返回数据格式非法: ${JSON.stringify(res)}`)
      }

      // 4. 解密数据
      const decrypted = this.decrypt(res)
      
      // 5. 检查业务状态码
      if (decrypted['Status'] != _Verify.STATE) {
        return Result.failure((decrypted['Msg'] as string) || '业务处理失败')
      }

      return Result.success(decrypted as T)
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error)
      logger.error(`API 请求异常 [${data.Api}]:`, errMessage)
      return Result.failure<T>(error instanceof Error ? error : new Error(errMessage))
    }
  }

  /**
   * RSA 解密 (使用公钥解密，常用于后端返回的新 AES 密钥)
   */
  private rsaDecrypt(data: string): Buffer {
    try {
      return crypto.publicDecrypt(
        {
          key: _Verify.publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(data, 'base64')
      )
    } catch (e) {
      throw new Error(`RSA 解密失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  /**
   * RSA 加密 (使用公钥加密 AES 密钥)
   */
  private rsaEncrypt(key: Buffer): string {
    try {
      const encrypted = crypto.publicEncrypt(
        {
          key: _Verify.publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        key
      )
      return encrypted.toString('base64')
    } catch (e) {
      throw new Error(`RSA 加密失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  /**
   * 解绑设备
   */
  async unbind(username: string, password: string) {
    return this.request<Unbind>({
      Api: 'DeleteAppUserKey',
      User: username,
      PassWord: password
    })
  }
}

/** 导出单例 */
const Verify = _Verify.to
export default Verify
