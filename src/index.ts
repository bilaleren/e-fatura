import EInvoiceApi from './EInvoiceApi'

export * from './types'
export * from './enums'
export * from './errors'

export { EInvoiceApi }
export { default as XsltRenderer } from './XsltRenderer'
export { getDateFormat, paymentPriceToText } from './utils'

const EInvoice = EInvoiceApi.create()

export default EInvoice
