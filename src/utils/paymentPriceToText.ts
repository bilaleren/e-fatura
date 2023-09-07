import { greaterThanValidator } from './validators'
import numberToText, { ConvertToNumberOptions } from 'number-to-text'

import 'number-to-text/converters/tr'

function paymentPriceToText(
  paymentPrice: number,
  options?: ConvertToNumberOptions
): string {
  greaterThanValidator(paymentPrice, 0, 'paymentPrice')

  const [main, sub] = paymentPrice.toFixed(2).split('.')

  const texts: string[] = [
    numberToText.convertToText(+main, {
      case: 'titleCase',
      language: 'tr',
      ...options
    }),
    'TL'
  ]

  if (sub !== '00') {
    texts.push(
      numberToText.convertToText(+sub, {
        case: 'titleCase',
        language: 'tr',
        ...options
      }),
      'Kuruş'
    )
  }

  return texts.join(' ').trim()
}

export default paymentPriceToText
