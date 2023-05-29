import EInvoiceTypeError from '../errors/EInvoiceTypeError'

export function isRequired(
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== 'string' || value === '') {
    throw new EInvoiceTypeError(`"${field}" alanı zorunlu.`)
  }
}

export function isLessThan(
  value: unknown,
  than: number,
  field: string
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < than) {
    throw new EInvoiceTypeError(`"${field}" alanı ${than}'dan küçük olamaz.`)
  }
}
