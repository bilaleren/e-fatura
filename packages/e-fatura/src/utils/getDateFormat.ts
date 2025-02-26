import { EInvoiceTypeError } from '../errors';

const DATE_FORMAT_PATTERN = /^(\d{2}\/\d{2}\/\d{4}|\d{2}:\d{2}:\d{2})$/;

function getDateFormat(
  value?: Date | string,
  format: 'date' | 'time' = 'date'
): string {
  let date: Date;

  if (typeof value === 'string') {
    if (DATE_FORMAT_PATTERN.test(value)) {
      return value;
    }

    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date();
  }

  if (date.toString() === 'Invalid Date') {
    throw new EInvoiceTypeError('Geçersiz tarih formatı.');
  }

  if (format === 'date') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export default getDateFormat;
