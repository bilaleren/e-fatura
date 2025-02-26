import isPlainObject from './isPlainObject';
import { EInvoiceTypeError } from '../errors';

function mappingBasicInvoiceIssuedToMeKeys(
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
      saticiVknTckn: taxOrIdentityNumber,
      saticiUnvanAdSoyad: titleOrFullName,
      belgeTarihi: documentDate,
      belgeTuru: documentType,
      onayDurumu: approvalStatus
    };
  }

  const {
    ettn = '',
    belgeNumarasi = '',
    saticiVknTckn = '',
    saticiUnvanAdSoyad = '',
    belgeTarihi = '',
    belgeTuru = '',
    onayDurumu = '',
    ...other
  } = value;

  return {
    ...other,
    uuid: ettn,
    documentNumber: belgeNumarasi,
    taxOrIdentityNumber: saticiVknTckn,
    titleOrFullName: saticiUnvanAdSoyad,
    documentDate: belgeTarihi,
    documentType: belgeTuru,
    approvalStatus: onayDurumu
  };
}

export default mappingBasicInvoiceIssuedToMeKeys;
