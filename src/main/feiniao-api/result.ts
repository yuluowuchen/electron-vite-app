/**
 * Result 包装类，用于处理可能失败的操作结果
 * 提供类型安全的成功/失败状态管理
 */
export default class Result<T, E = Error> {
  /**
   * 创建失败的 Result 实例（字符串错误）
   * @param errorMessage 失败时的错误消息字符串
   * @param data 失败时的可选数据
   * @returns 失败的 Result 实例
   */
  static failure<T>(errorMessage: string, data?: T): Result<T, Error>
  /**
   * 创建失败的 Result 实例（Error 对象）
   * @param error 失败时的错误对象
   * @param data 失败时的可选数据
   * @returns 失败的 Result 实例
   */
  static failure<T, E = Error>(error: E, data?: T): Result<T, E>
  /**
   * 创建失败的 Result 实例（实现）
   */
  static failure<T, E = Error>(error: E | string, data?: T): Result<T, E | Error> {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    return new Result<T, E | Error>(false, data, errorObj)
  }
  /**
   * 创建成功的 Result 实例
   * @param data 成功时的数据
   * @returns 成功的 Result 实例
   */
  static success<T, E = Error>(data: T): Result<T, E> {
    return new Result<T, E>(true, data, undefined)
  }

  constructor(
    readonly success: boolean,
    readonly data?: T,
    readonly error?: E
  ) {}
}
