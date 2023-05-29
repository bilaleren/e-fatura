class EInvoiceTypeError extends TypeError {
  constructor(public message: string) {
    super(message)
  }
}

export default EInvoiceTypeError
