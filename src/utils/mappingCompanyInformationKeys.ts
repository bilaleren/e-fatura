import isPlainObject from './isPlainObject'
import EInvoiceTypeError from '../errors/EInvoiceTypeError'

function mappingCompanyInformationKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new EInvoiceTypeError('Şirket bilgisi verisi mevcut değil.')
  }

  if (mappingWithTurkishKeys) {
    const {
      title = '',
      firstName = '',
      lastName = '',
      taxOffice = '',
      ...other
    } = value

    return {
      ...other,
      unvan: title,
      adi: firstName,
      soyadi: lastName,
      vergiDairesi: taxOffice
    }
  }

  const {
    unvan = '',
    adi = '',
    soyadi = '',
    vergiDairesi = '',
    ...other
  } = value

  return {
    ...other,
    title: unvan,
    firstName: adi,
    lastName: soyadi,
    taxOffice: vergiDairesi
  }
}

export default mappingCompanyInformationKeys
