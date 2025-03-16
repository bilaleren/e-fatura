import isPlainObject from './isPlainObject';
import { EInvoiceTypeError } from '../errors';

function mappingCompanyInformationKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new EInvoiceTypeError('Şirket bilgisi verisi mevcut değil.');
  }

  if (mappingWithTurkishKeys) {
    const {
      title = '',
      firstName = '',
      lastName = '',
      taxOffice = '',
      ...other
    } = value;

    return {
      ...other,
      unvan: title,
      adi: firstName,
      soyadi: lastName,
      vergiDairesi: taxOffice
    };
  }

  const {
    unvan: title = '',
    adi: firstName = '',
    soyadi: lastName = '',
    vergiDairesi: taxOffice = '',
    ...other
  } = value;

  return {
    ...other,
    title,
    firstName,
    lastName,
    taxOffice
  };
}

export default mappingCompanyInformationKeys;
