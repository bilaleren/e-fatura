declare module 'number-to-text' {
  export interface ConvertToNumberOptions {
    case?: 'titleCase' | 'lowerCase' | 'upperCase'
    spaces?: boolean
    language?: string
    separator?: string
  }

  export interface NumberToText {
    convertToText(value: number, options?: ConvertToNumberOptions): string
  }

  const numberToText: NumberToText

  export default numberToText
}
