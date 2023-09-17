import EInvoiceApi from './EInvoiceApi'

const EInvoice = EInvoiceApi.create()

export * from './types'
export type { EInvoiceApiErrorResponse } from './errors/EInvoiceApiError'

export { EInvoiceApi }
export { default as XsltRenderer } from './XsltRenderer'
export { default as getDateFormat } from './utils/getDateFormat'
export { default as paymentPriceToText } from './utils/paymentPriceToText'
export { default as InvoiceType } from './enums/InvoiceType'
export { default as EInvoiceCountry } from './enums/EInvoiceCountry'
export { default as EInvoiceUnitType } from './enums/EInvoiceUnitType'
export { default as EInvoiceCurrencyType } from './enums/EInvoiceCurrencyType'
export { default as EInvoiceApiErrorCode } from './enums/EInvoiceApiErrorCode'
export { default as InvoiceApprovalStatus } from './enums/InvoiceApprovalStatus'
export { default as EInvoiceTypeError } from './errors/EInvoiceTypeError'
export { default as EInvoiceApiError } from './errors/EInvoiceApiError'

export default EInvoice
