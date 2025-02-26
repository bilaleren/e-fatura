import { it, expect, describe } from 'vitest';
import { EInvoiceTypeError } from '../../errors';
import { uuidV1, mappingInvoiceKeys } from '../../utils';
import { generateMockInvoice } from '../../utils/test';

describe('mappingInvoiceKeys()', () => {
  it('Fatura verisi obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingInvoiceKeys('');
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingInvoiceKeys(0);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingInvoiceKeys(null);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingInvoiceKeys(undefined);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingInvoiceKeys(false);
    }).toThrow(EInvoiceTypeError);
  });

  it('Fatura verisini ingilizce anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1();
    const date = new Date();
    const invoicePayload = generateMockInvoice({
      uuid,
      date,
      mappingWithTurkishKeys: true
    });

    expect(mappingInvoiceKeys(invoicePayload)).toStrictEqual(
      generateMockInvoice({
        uuid,
        date
      })
    );
  });
});
