import { it, expect, describe } from 'vitest';
import { EInvoiceTypeError } from '../../errors';
import { uuidV1, mappingBasicInvoiceIssuedToMeKeys } from '../../utils';
import { generateMockBasicInvoiceIssuedToMe } from '../../utils/test';

describe('mappingBasicInvoiceIssuedToMeKeys()', () => {
  it('Fatura bir obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingBasicInvoiceIssuedToMeKeys('');
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceIssuedToMeKeys(0);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceIssuedToMeKeys(null);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceIssuedToMeKeys(undefined);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingBasicInvoiceIssuedToMeKeys(false);
    }).toThrow(EInvoiceTypeError);
  });

  it('Fatura anahtarlarını ingilizce anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1();
    const invoice = generateMockBasicInvoiceIssuedToMe({
      uuid,
      mappingWithTurkishKeys: true
    });

    expect(mappingBasicInvoiceIssuedToMeKeys(invoice)).toStrictEqual(
      generateMockBasicInvoiceIssuedToMe({
        uuid
      })
    );
  });

  it('Fatura anahtarlarını türkçe anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1();
    const invoice = generateMockBasicInvoiceIssuedToMe({
      uuid
    });

    expect(mappingBasicInvoiceIssuedToMeKeys(invoice, true)).toStrictEqual(
      generateMockBasicInvoiceIssuedToMe({
        uuid,
        mappingWithTurkishKeys: true
      })
    );
  });
});
