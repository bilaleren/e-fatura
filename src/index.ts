import EInvoiceApi from './EInvoiceApi'

const EInvoice = new EInvoiceApi()

export * from './types'

export { EInvoiceApi }
export { default as InvoiceType } from './enums/InvoiceType'
export { default as getDateFormat } from './utils/getDateFormat'
export { default as EInvoiceCountry } from './enums/EInvoiceCountry'
export { default as EInvoiceUnitType } from './enums/EInvoiceUnitType'
export { default as EInvoiceCurrencyType } from './enums/EInvoiceCurrencyType'
export { default as EInvoiceApiErrorCode } from './enums/EInvoiceApiErrorCode'
export { default as InvoiceApprovalStatus } from './enums/InvoiceApprovalStatus'
export { default as EInvoiceError } from './errors/EInvoiceError'
export { default as EInvoiceApiError } from './errors/EInvoiceApiError'
export type { EInvoiceApiErrorResponse } from './errors/EInvoiceApiError'

export default EInvoice
