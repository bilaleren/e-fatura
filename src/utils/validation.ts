import EInvoiceError from '../errors/EInvoiceError'

export function isRequired(
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== 'string' || value === '') {
    throw new EInvoiceError(`"${field}" alanı zorunlu.`)
  }
}

export function isLessThan(
  value: unknown,
  than: number,
  field: string
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < than) {
    throw new EInvoiceError(`"${field}" alanı ${than}'dan küçük olamaz.`)
  }
}
