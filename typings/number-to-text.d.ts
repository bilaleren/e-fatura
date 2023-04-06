declare module 'number-to-text' {
  interface ConvertToNumberOptions {
    case?: 'titleCase' | 'lowerCase' | 'upperCase'
    language?: string
    separator?: string
  }

  export interface NumberToText {
    convertToText(value: number, options?: ConvertToNumberOptions): string
  }

  const numberToText: NumberToText

  export default numberToText
}
