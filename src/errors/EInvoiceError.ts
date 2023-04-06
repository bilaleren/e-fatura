class EInvoiceError extends Error {
  constructor(public message: string) {
    super(message)
  }
}

export default EInvoiceError
