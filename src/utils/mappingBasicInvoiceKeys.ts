import isPlainObject from './isPlainObject'
import { EInvoiceTypeError } from '../errors'

function mappingBasicInvoiceKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new EInvoiceTypeError('Geçersiz fatura verisi.')
  }

  if (mappingWithTurkishKeys) {
    const {
      uuid = '',
      documentNumber = '',
      taxOrIdentityNumber = '',
      buyerTitleOrFullName = '',
      documentDate = '',
      documentType = '',
      approvalStatus = '',
      ...other
    } = value

    return {
      ...other,
      ettn: uuid,
      belgeNumarasi: documentNumber,
      aliciVknTckn: taxOrIdentityNumber,
      aliciUnvanAdSoyad: buyerTitleOrFullName,
      belgeTarihi: documentDate,
      belgeTuru: documentType,
      onayDurumu: approvalStatus
    }
  }

  const {
    ettn = '',
    belgeNumarasi = '',
    aliciVknTckn = '',
    aliciUnvanAdSoyad = '',
    belgeTarihi = '',
    belgeTuru = '',
    onayDurumu = '',
    ...other
  } = value

  return {
    ...other,
    uuid: ettn,
    documentNumber: belgeNumarasi,
    taxOrIdentityNumber: aliciVknTckn,
    buyerTitleOrFullName: aliciUnvanAdSoyad,
    documentDate: belgeTarihi,
    documentType: belgeTuru,
    approvalStatus: onayDurumu
  }
}

export default mappingBasicInvoiceKeys
