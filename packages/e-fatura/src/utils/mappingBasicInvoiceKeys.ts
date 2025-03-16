import isPlainObject from './isPlainObject';
import { EInvoiceTypeError } from '../errors';

function mappingBasicInvoiceKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new EInvoiceTypeError('Geçersiz fatura verisi.');
  }

  if (mappingWithTurkishKeys) {
    const {
      uuid = '',
      documentNumber = '',
      taxOrIdentityNumber = '',
      titleOrFullName = '',
      documentDate = '',
      documentType = '',
      approvalStatus = '',
      ...other
    } = value;

    return {
      ...other,
      ettn: uuid,
      belgeNumarasi: documentNumber,
      aliciVknTckn: taxOrIdentityNumber,
      aliciUnvanAdSoyad: titleOrFullName,
      belgeTarihi: documentDate,
      belgeTuru: documentType,
      onayDurumu: approvalStatus
    };
  }

  const {
    ettn: uuid = '',
    belgeNumarasi: documentNumber = '',
    aliciVknTckn: taxOrIdentityNumber = '',
    aliciUnvanAdSoyad: titleOrFullName = '',
    belgeTarihi: documentDate = '',
    belgeTuru: documentType = '',
    onayDurumu: approvalStatus = '',
    ...other
  } = value;

  return {
    ...other,
    uuid,
    documentNumber,
    taxOrIdentityNumber,
    titleOrFullName,
    documentDate,
    documentType,
    approvalStatus
  };
}

export default mappingBasicInvoiceKeys;
