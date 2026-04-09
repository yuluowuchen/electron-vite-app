export default class Validator {
  static isBase64(str: string): boolean {
    return /^[0-9a-zA-Z+/=]+$/.test(str)
  }
  static isHex(str: string): boolean {
    return /^[0-9a-fA-F]+$/.test(str)
  }
  static isMd5(str: string): boolean {
    return /^[0-9a-fA-F]{32}$/.test(str)
  }
  static isNumber(str: string): boolean {
    return /^[0-9]+$/.test(str)
  }
  private constructor() {
    //
  }
}
