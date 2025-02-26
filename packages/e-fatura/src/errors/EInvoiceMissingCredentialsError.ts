import EInvoiceError from './EInvoiceError';
import type { Credentials } from '../types';

class EInvoiceMissingCredentialsError extends EInvoiceError {
  readonly credentials!: Credentials;

  constructor(message: string, credentials: Credentials) {
    super(message);
    this.credentials = credentials;
  }

  get name(): string {
    return EInvoiceMissingCredentialsError.name;
  }
}

export default EInvoiceMissingCredentialsError;
