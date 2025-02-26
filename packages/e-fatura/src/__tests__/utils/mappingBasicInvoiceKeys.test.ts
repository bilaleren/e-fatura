import { it, expect, describe } from 'vitest';
import { EInvoiceTypeError } from '../../errors';
import { uuidV1, mappingBasicInvoiceKeys } from '../../utils';
import { generateMockBasicInvoice } from '../../utils/test';

describe('mappingInvoiceKeys()', () => {
  it('Fatura bir obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingBasicInvoiceKeys('');
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceKeys(0);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceKeys(null);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceKeys(undefined);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceKeys(false);
    }).toThrow(EInvoiceTypeError);
  });

  it('Fatura anahtarlarını ingilizce anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1();
    const invoice = generateMockBasicInvoice({
      uuid,
      mappingWithTurkishKeys: true
    });

    expect(mappingBasicInvoiceKeys(invoice)).toStrictEqual(
      generateMockBasicInvoice({
        uuid
      })
    );
  });

  it('Fatura anahtarlarını türkçe anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1();
    const invoice = generateMockBasicInvoice({
      uuid
    });

    expect(mappingBasicInvoiceKeys(invoice, true)).toStrictEqual(
      generateMockBasicInvoice({
        uuid,
        mappingWithTurkishKeys: true
      })
    );
  });
});
