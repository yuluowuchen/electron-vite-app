import { ipcMain } from 'electron'
import Verify from './verify'

/**
 * 设置验证相关的 IPC 处理器
 */
export function setupVerifyManager() {
  // 初始化验证系统 (获取 token)
  ipcMain.handle('verify-init', async () => {
    return await Verify.init()
  })

  // 用户登录
  ipcMain.handle('verify-login', async (_, { username, password }) => {
    return await Verify.login(username, password)
  })

  // 用户注册
  ipcMain.handle('verify-register', async (_, { username, password }) => {
    return await Verify.register(username, password)
  })

  // 获取用户信息
  ipcMain.handle('verify-get-user-info', async () => {
    return await Verify.getUserInfo()
  })

  // 刷新 Token
  ipcMain.handle('verify-refresh-token', async () => {
    return await Verify.refreshToken()
  })

  // 卡密充值
  ipcMain.handle('verify-recharge', async (_, { username, cdKey }) => {
    return await Verify.recharge(username, cdKey)
  })

  // 解绑设备
  ipcMain.handle('verify-unbind', async (_, { username, password }) => {
    return await Verify.unbind(username, password)
  })

  // 获取公告
  ipcMain.handle('verify-get-notice', async () => {
    return await Verify.getNotice()
  })

  // 获取应用信息
  ipcMain.handle('verify-get-app-info', async () => {
    return await Verify.getAppInfo()
  })

  // 获取软件用户信息
  ipcMain.handle('verify-get-app-user-info', async () => {
    return await Verify.getAppUserInfo()
  })

  // 获取会员到期时间
  ipcMain.handle('verify-get-vip-time', async () => {
    return await Verify.getAppUserVipTime()
  })

  // 获取用户余额
  ipcMain.handle('verify-get-user-rmb', async () => {
    return await Verify.getUserRmb()
  })

  // 获取用户积分
  ipcMain.handle('verify-get-vip-number', async () => {
    return await Verify.getAppUserVipNumber()
  })

  // 退出登录
  ipcMain.handle('verify-logout', async () => {
    const res = await Verify.logout()    
    return res
  })

  // 检查登录状态
  ipcMain.handle('verify-check-login', async () => {
    return await Verify.isLogin()
  })

  // 检查应用更新
  ipcMain.handle('verify-check-update', async () => {
    return await Verify.checkUpdate()
  })

  // 获取应用更新配置 JSON
  ipcMain.handle('verify-get-app-update-json', async () => {
    return await Verify.getAppUpdateJson()
  })

  // 购卡直冲
  ipcMain.handle('verify-pay-ka-usa', async (_, { user, kaClassId, payType }) => {
    return await Verify.payKaUsa(user, kaClassId, payType)
  })
}
