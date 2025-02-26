import EInvoiceError from './EInvoiceError';
import type { EInvoiceApiErrorCode } from '../enums';

export interface EInvoiceApiErrorResponse<T = unknown> {
  data: T;
  errorCode: EInvoiceApiErrorCode;
}

class EInvoiceApiError<T = unknown> extends EInvoiceError {
  readonly response!: EInvoiceApiErrorResponse<T>;

  constructor(message: string, response: EInvoiceApiErrorResponse<T>) {
    super(message);
    this.response = response;
  }

  get name(): string {
    return EInvoiceApiError.name;
  }

  get errorCode(): EInvoiceApiErrorCode {
    return this.response.errorCode;
  }
}

export default EInvoiceApiError;
