import { EInvoiceTypeError } from '../errors';

export function stringValidator(
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== 'string') {
    throw new EInvoiceTypeError(
      [
        `"${field}" alanı dizi (string) türünde bir değere sahip olmalıdır.`,
        `(Sağlanan değer: "${value}").`
      ].join(' ')
    );
  }
}

export function notEmptyStringValidator(
  value: unknown,
  field: string
): asserts value is string {
  stringValidator(value, field);

  if (value === '') {
    throw new EInvoiceTypeError(
      `"${field}" alanı boş bir dizi (string) olamaz.`
    );
  }
}

export function greaterThanValidator(
  value: unknown,
  than: number,
  field: string
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= than) {
    throw new EInvoiceTypeError(
      `"${field}" alanı ${than}'dan büyük olmalıdır.`
    );
  }
}
