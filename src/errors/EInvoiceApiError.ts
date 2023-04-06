import type EInvoiceApiErrorCode from '../enums/EInvoiceApiErrorCode'

export interface EInvoiceApiErrorResponse {
  data: unknown
  errorCode: EInvoiceApiErrorCode
  httpStatusText?: string
  httpStatusCode?: number
}

class EInvoiceApiError extends Error {
  constructor(
    public message: string,
    private response: EInvoiceApiErrorResponse
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
