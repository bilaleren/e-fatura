import isObject from './isObject'
import EInvoiceError from '../errors/EInvoiceError'

function mappingCompanyInformationKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isObject(value)) {
    throw new EInvoiceError('Şirket bilgisi verisi mevcut değil.')
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
