import type { EInvoiceApiErrorCode } from '../enums'

export interface EInvoiceApiErrorResponse {
  data: unknown
  errorCode: EInvoiceApiErrorCode
  httpStatusText?: string
  httpStatusCode?: number
}

class EInvoiceApiError extends Error {
  constructor(
    public readonly message: string,
    private readonly response: EInvoiceApiErrorResponse
  ) {
    super(message)
  }

  getResponse(): EInvoiceApiErrorResponse {
    return this.response
  }

  get errorCode(): EInvoiceApiErrorCode {
    return this.response.errorCode
  }
}

export default EInvoiceApiError
