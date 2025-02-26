import EInvoiceError from './EInvoiceError';

class EInvoiceTypeError extends EInvoiceError {
  get name(): string {
    return EInvoiceTypeError.name;
  }
}

export default EInvoiceTypeError;
