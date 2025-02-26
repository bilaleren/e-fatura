abstract class EInvoiceError extends Error {
  abstract get name(): string;
}

export default EInvoiceError;
