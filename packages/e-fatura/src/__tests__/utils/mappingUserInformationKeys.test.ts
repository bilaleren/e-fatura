import { it, expect, describe } from 'vitest';
import { EInvoiceTypeError } from '../../errors';
import mappingUserInformationKeys from '../../utils/mappingUserInformationKeys';

describe('mappingUserInformationKeys()', () => {
  it('Kullanıcı bilgileri obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingUserInformationKeys('');
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingUserInformationKeys(0);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingUserInformationKeys(null);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingUserInformationKeys(undefined);
    }).toThrow(EInvoiceTypeError);

    expect(() => {
      mappingUserInformationKeys(false);
    }).toThrow(EInvoiceTypeError);
  });

  it('Kullanıcı bilgileri anahtarlarını ingilizce anahtarlar ile değiştirmeli.', () => {
    const userInformation = mappingUserInformationKeys({
      unvan: 'unvan',
      ad: 'ad',
      soyad: 'soyad',
      vknTckn: 'vknTckn',
      ePostaAdresi: 'ePostaAdresi',
      webSitesiAdresi: 'webSitesiAdresi',
      sicilNo: 'sicilNo',
      mersisNo: 'mersisNo',
      vergiDairesi: 'vergiDairesi',
      cadde: 'cadde',
      apartmanAdi: 'apartmanAdi',
      apartmanNo: 'apartmanNo',
      kapiNo: 'kapiNo',
      kasaba: 'kasaba',
      il: 'il',
      ilce: 'ilce',
      postaKodu: 'postaKodu',
      ulke: 'ulke',
      telNo: 'telNo',
      faksNo: 'faksNo',
      isMerkezi: 'isMerkezi'
    });

    expect(userInformation).toStrictEqual({
      title: 'unvan',
      firstName: 'ad',
      lastName: 'soyad',
      taxOrIdentityNumber: 'vknTckn',
      email: 'ePostaAdresi',
      website: 'webSitesiAdresi',
      recordNumber: 'sicilNo',
      mersisNumber: 'mersisNo',
      taxOffice: 'vergiDairesi',
      street: 'cadde',
      buildingName: 'apartmanAdi',
      buildingNumber: 'apartmanNo',
      doorNumber: 'kapiNo',
      town: 'kasaba',
      city: 'il',
      district: 'ilce',
      postNumber: 'postaKodu',
      country: 'ulke',
      phoneNumber: 'telNo',
      faxNumber: 'faksNo',
      businessCenter: 'isMerkezi'
    });
  });

  it('Kullanıcı bilgileri anahtarlarını türkçe anahtarlar ile değiştirmeli.', () => {
    const userInformation = mappingUserInformationKeys(
      {
        title: 'title',
        firstName: 'firstName',
        lastName: 'lastName',
        taxOrIdentityNumber: 'taxOrIdentityNumber',
        email: 'email',
        website: 'website',
        recordNumber: 'recordNumber',
        mersisNumber: 'mersisNumber',
        taxOffice: 'taxOffice',
        street: 'street',
        buildingName: 'buildingName',
        buildingNumber: 'buildingNumber',
        doorNumber: 'doorNumber',
        town: 'town',
        city: 'city',
        district: 'district',
        postNumber: 'postNumber',
        country: 'country',
        phoneNumber: 'phoneNumber',
        faxNumber: 'faxNumber',
        businessCenter: 'businessCenter'
      },
      true
    );

    expect(userInformation).toStrictEqual({
      unvan: 'title',
      ad: 'firstName',
      soyad: 'lastName',
      vknTckn: 'taxOrIdentityNumber',
      ePostaAdresi: 'email',
      webSitesiAdresi: 'website',
      sicilNo: 'recordNumber',
      mersisNo: 'mersisNumber',
      vergiDairesi: 'taxOffice',
      cadde: 'street',
      apartmanAdi: 'buildingName',
      apartmanNo: 'buildingNumber',
      kapiNo: 'doorNumber',
      kasaba: 'town',
      il: 'city',
      ilce: 'district',
      postaKodu: 'postNumber',
      ulke: 'country',
      telNo: 'phoneNumber',
      faksNo: 'faxNumber',
      isMerkezi: 'businessCenter'
    });
  });
});
