import type { Credentials } from '../types'

class EInvoiceMissingCredentialsError extends Error {
  constructor(
    public readonly message: string,
    public readonly credentials: Credentials
  ) {
    super(message)
  }
}

export default EInvoiceMissingCredentialsError
