declare module 'number-to-text' {
  export interface ConvertToTextOptions {
    case?: 'titleCase' | 'lowerCase' | 'upperCase'
    spaces?: boolean
    language?: string
    separator?: string
  }

  interface NumberToText {
    convertToText(value: number, options?: ConvertToTextOptions): string
  }

  const numberToText: NumberToText

  export default numberToText
}
