import isObject from './isObject'
import EInvoiceError from '../errors/EInvoiceError'

function mappingBasicInvoiceKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isObject(value)) {
    throw new EInvoiceError('Geçersiz fatura verisi.')
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
