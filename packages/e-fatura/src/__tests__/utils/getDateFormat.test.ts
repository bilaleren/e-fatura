import { it, expect, describe } from 'vitest';
import getDateFormat from '../../utils/getDateFormat';
import { EInvoiceTypeError } from '../../errors';

describe('getDateFormat()', () => {
  it('Bugünü DD/MM/YYYY formatında döndürmeli.', () => {
    const date = new Date();
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = `${date.getFullYear()}`;
    const format = `${day}/${month}/${year}`;

    expect(getDateFormat()).toBe(format);
    expect(getDateFormat(undefined, 'date')).toBe(format);
  });

  it('Geçersiz bir tarih olduğunda hata fırlatmalı.', () => {
    expect(() => {
      getDateFormat('');
    }).toThrow(EInvoiceTypeError);
  });

  it('28/03/2023 tarihi döndürmeli.', () => {
    expect(getDateFormat('28/03/2023')).toBe('28/03/2023');
  });

  it('22:53:53 zamanını döndürmeli.', () => {
    expect(getDateFormat('22:53:53')).toBe('22:53:53');
  });

  it('Tarihi DD/MM/YYYY formatında döndürmeli.', () => {
    const date = new Date();
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = `${date.getFullYear()}`;
    const format = `${day}/${month}/${year}`;

    expect(getDateFormat(date)).toBe(format);
    expect(getDateFormat(date, 'date')).toBe(format);
  });

  it('Tarihi HH:MM:SS formatında döndürmeli.', () => {
    const date = new Date();
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');

    expect(getDateFormat(date, 'time')).toBe(`${hours}:${minutes}:${seconds}`);
  });
});
