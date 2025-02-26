import EInvoiceError from './EInvoiceError';

class EInvoiceMissingTokenError extends EInvoiceError {
  get name(): string {
    return EInvoiceMissingTokenError.name;
  }
}

export default EInvoiceMissingTokenError;
