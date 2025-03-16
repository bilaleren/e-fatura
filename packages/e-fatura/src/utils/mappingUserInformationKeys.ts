import isPlainObject from './isPlainObject';
import { EInvoiceTypeError } from '../errors';

function mappingUserInformationKeys(
  value: unknown,
  mappingWithTurkishKeys?: boolean
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new EInvoiceTypeError('Kullanıcı bilgisi verisi mevcut değil.');
  }

  if (mappingWithTurkishKeys) {
    const {
      title = '',
      firstName = '',
      lastName = '',
      taxOrIdentityNumber = '',
      email = '',
      website = '',
      recordNumber = '',
      mersisNumber = '',
      taxOffice = '',
      street = '',
      buildingName = '',
      buildingNumber = '',
      doorNumber = '',
      town = '',
      city = '',
      district = '',
      postNumber = '',
      country = '',
      phoneNumber = '',
      faxNumber = '',
      businessCenter = '',
      ...other
    } = value;

    return {
      ...other,
      unvan: title,
      ad: firstName,
      soyad: lastName,
      vknTckn: taxOrIdentityNumber,
      ePostaAdresi: email,
      webSitesiAdresi: website,
      sicilNo: recordNumber,
      mersisNo: mersisNumber,
      vergiDairesi: taxOffice,
      cadde: street,
      apartmanAdi: buildingName,
      apartmanNo: buildingNumber,
      kapiNo: doorNumber,
      kasaba: town,
      il: city,
      ilce: district,
      postaKodu: postNumber,
      ulke: country,
      telNo: phoneNumber,
      faksNo: faxNumber,
      isMerkezi: businessCenter
    };
  }

  const {
    unvan: title = '',
    ad: firstName = '',
    soyad: lastName = '',
    vknTckn: taxOrIdentityNumber = '',
    ePostaAdresi: email = '',
    webSitesiAdresi: website = '',
    sicilNo: recordNumber = '',
    mersisNo: mersisNumber = '',
    vergiDairesi: taxOffice = '',
    cadde: street = '',
    apartmanAdi: buildingName = '',
    apartmanNo: buildingNumber = '',
    kapiNo: doorNumber = '',
    kasaba: town = '',
    il: city = '',
    ilce: district = '',
    postaKodu: postNumber = '',
    ulke: country = '',
    telNo: phoneNumber = '',
    faksNo: faxNumber = '',
    isMerkezi: businessCenter = '',
    ...other
  } = value;

  return {
    ...other,
    title,
    firstName,
    lastName,
    taxOrIdentityNumber,
    email,
    website,
    recordNumber,
    mersisNumber,
    taxOffice,
    street,
    buildingName,
    buildingNumber,
    doorNumber,
    town,
    city,
    district,
    postNumber,
    country,
    phoneNumber,
    faxNumber,
    businessCenter
  };
}

export default mappingUserInformationKeys;
