export interface ApiResponse<T = any> {
  Data?: T
  Time?: number
  Status?: number
  Msg?: string
}

export interface UpdateJson {
  downloadUrl: string
  updateContent: Record<string, unknown>
}

export interface CheckUpdateData {
  IsUpdate?: boolean
  NewVersion?: string
  Version?: number
}
export type CheckUpdate = ApiResponse<CheckUpdateData>

export interface GetAppUpdateJsonData {
  AppUpDataJson?: string
}
export type GetAppUpdateJson = ApiResponse<GetAppUpdateJsonData>

export interface GetNoticeData {
  AppGongGao?: string
}
export type GetNotice = ApiResponse<GetNoticeData>

export interface GetPrivateVariableData {
  '企链通_全套'?: string
}
export type GetPrivateVariable = ApiResponse<GetPrivateVariableData>

export interface QueueCount {
  AppId?: number
  Name?: string
  Value?: string
  Type?: number
  IsVip?: number
  Time?: number
  Note?: string
  Sort?: number
}
export interface GetPublicVariableData {
  QueueCount?: QueueCount
  repo?: string
}
export type GetPublicVariable = ApiResponse<GetPublicVariableData>

export interface GetTokenData {
  Token?: string
  CryptoKeyAes?: string
  IP?: string
}
export type GetToken = ApiResponse<GetTokenData>

export interface HeartbeatData {
  Status?: number
}
export type Heartbeat = ApiResponse<HeartbeatData>

export interface LoginData {
  AgentUid?: number
  Key?: string
  LoginIp?: string
  LoginTime?: number
  NewAppUser?: boolean
  OutUser?: number
  RegisterTime?: number
  User?: string
  UserClassMark?: number
  UserClassName?: string
  VipNumber?: number
  VipTime?: number
}
export type Login = ApiResponse<LoginData>

export interface RechargeData {
  InviteUser?: boolean
}
export type Recharge = ApiResponse<RechargeData>

export type Register = ApiResponse<never>

export interface UnbindData {
  ReduceVipTime?: number
}
export type Unbind = ApiResponse<UnbindData>

// --- New interfaces below ---

export interface GetUserIpData {
  IP?: string
}
export type GetUserIp = ApiResponse<GetUserIpData>

export interface UserReduceMoneyData {
  Money?: number
}
export type UserReduceMoney = ApiResponse<UserReduceMoneyData>

export interface UserReduceVipNumberData {
  VipNumber?: number
}
export type UserReduceVipNumber = ApiResponse<UserReduceVipNumberData>

export interface UserReduceVipTimeData {
  VipTime?: number
}
export type UserReduceVipTime = ApiResponse<UserReduceVipTimeData>

export interface GetVipDataInfo {
  VipData?: string
  VipData2?: string
}
export type GetVipData = ApiResponse<GetVipDataInfo>

export interface GetAppHomeUrlData {
  AppHomeUrl?: string
}
export type GetAppHomeUrl = ApiResponse<GetAppHomeUrlData>

export interface SetAppUserKeyData {
  ReduceVipTime?: number
}
export type SetAppUserKey = ApiResponse<SetAppUserKeyData>

export interface GetCaptchaData {
  CaptChaImg?: string
  CaptchaId?: string
  CaptchaType?: number
}
export type GetCaptcha = ApiResponse<GetCaptchaData>

export interface GetSmsCaptchaData {
  CaptchaId?: string
  CaptchaType?: number
}
export type GetSmsCaptcha = ApiResponse<GetSmsCaptchaData>

export interface GetAppUserKeyData {
  Key?: string
}
export type GetAppUserKey = ApiResponse<GetAppUserKeyData>

export interface GetIsUserData {
  IsUser?: boolean
}
export type GetIsUser = ApiResponse<GetIsUserData>

export interface SetUserQqEmailPhoneData {}
export type SetUserQqEmailPhone = ApiResponse<SetUserQqEmailPhoneData>

export interface GetAppInfoData {
  AppId?: number
  AppType?: number
  AppName?: string
  AppWeb?: string
}
export type GetAppInfo = ApiResponse<GetAppInfoData>

export interface GetSystemTimeData {
  Time?: number
}
export type GetSystemTime = ApiResponse<GetSystemTimeData>

export interface GetAppUserNoteData {
  Note?: string
}
export type GetAppUserNote = ApiResponse<GetAppUserNoteData>

export interface GetAppUserVipTimeData {
  VipTime?: number
}
export type GetAppUserVipTime = ApiResponse<GetAppUserVipTimeData>

export interface GetUserRmbData {
  Rmb?: number
}
export type GetUserRmb = ApiResponse<GetUserRmbData>

export interface GetAppUserVipNumberData {
  VipNumber?: number
}
export type GetAppUserVipNumber = ApiResponse<GetAppUserVipNumberData>

export interface GetCaptchaApiListData {
  [key: string]: number
}
export type GetCaptchaApiList = ApiResponse<string> // API returns a stringified JSON in `Data`

// --- Additional interfaces below ---

export interface GetTabData {
  Tab?: string
}
export type GetTab = ApiResponse<GetTabData>

export interface PayMoneyToVipNumberData {
  AddVipNumber?: number
}
export type PayMoneyToVipNumber = ApiResponse<PayMoneyToVipNumberData>

export interface GetPayKaListInfo {
  Id?: number
  Money?: number
  Name?: string
}
export type GetPayKaList = ApiResponse<GetPayKaListInfo[]>

export interface PayMoneyToKaData {
  AppId?: number
  KaClassId?: number
  KaClassName?: string
  KaName?: string
}
export type PayMoneyToKa = ApiResponse<PayMoneyToKaData>

export interface GetPurchasedKaInfo {
  AppId?: number
  Id?: number
  KaClassId?: number
  KaClassName?: string
  Money?: number
  Name?: string
  Num?: number
  NumMax?: number
  RegisterTime?: number
  Status?: number
}
export type GetPurchasedKaList = ApiResponse<GetPurchasedKaInfo[]>

export interface GetUserClassInfo {
  Mark?: number
  Name?: string
  Weight?: number
}
export type GetUserClassList = ApiResponse<GetUserClassInfo[]>

export interface SetUserClassData {
  UserClassMark?: number
  UserClassName?: string
  VipTime?: number
}
export type SetUserClass = ApiResponse<SetUserClassData>

export interface RunJSData {
  Return?: any
  Time?: number
}
export type RunJS = ApiResponse<RunJSData>

export interface TaskPoolNewDataInfo {
  TaskUuid?: string
}
export type TaskPoolNewData = ApiResponse<TaskPoolNewDataInfo>

export interface TaskPoolGetDataInfo {
  ReturnData?: string
  Status?: number
  TimeEnd?: number
  TimeStart?: number
}
export type TaskPoolGetData = ApiResponse<TaskPoolGetDataInfo>

export interface TaskPoolGetTaskInfo {
  uuid?: string
  Tid?: number
  TimeStart?: number
  SubmitData?: string
}
export type TaskPoolGetTask = ApiResponse<TaskPoolGetTaskInfo[]>

export interface PayKaUsaData {
  OrderId?: string
  PayURL?: string
  PayQRCode?: string
  PayQRCodePNG?: string
}
export type PayKaUsa = ApiResponse<PayKaUsaData>

export interface GetPayOrderStatusData {
  Status?: number
}
export type GetPayOrderStatus = ApiResponse<GetPayOrderStatusData>

export interface GetUserConfigData {
  [key: string]: string
}
export type GetUserConfig = ApiResponse<GetUserConfigData>

// --- Existing interfaces ---

// 用户信息
export interface AppUserInfo {
  Id?: number
  Uid?: number
  Key?: string
  MaxOnline?: number
  LoginIp?: string
  LoginTime?: number
  RegisterTime?: number
  Status?: number
  User?: string
  UserClassId?: number
  UserClassMark?: number
  UserClassName?: string
  UserClassWeight?: number
  VipNumber?: number
  VipTime?: number
}

// 获取用户信息
export type GetUserInfo = ApiResponse<AppUserInfo>
