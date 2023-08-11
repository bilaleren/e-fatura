import deepMerge from 'lodash.merge'
import getDateFormat from '../getDateFormat'
import InvoiceType from '../../enums/InvoiceType'
import EInvoiceCountry from '../../enums/EInvoiceCountry'
import EInvoiceUnitType from '../../enums/EInvoiceUnitType'
import EInvoiceCurrencyType from '../../enums/EInvoiceCurrencyType'

interface GenerateMockInvoiceOptions {
  uuid: string
  date: Date
  numberToString?: boolean
  custom?: Record<string, unknown>
  mappingWithTurkishKeys?: boolean
}

function stringOrNumber(cond: boolean, value: number): string | number {
  return cond ? value.toString() : value
}

function generateMockInvoice(
  options: GenerateMockInvoiceOptions
): Record<string, unknown> {
  const {
    uuid,
    date,
    custom = {},
    numberToString = false,
    mappingWithTurkishKeys = false
  } = options

  if (mappingWithTurkishKeys) {
    return deepMerge(
      {
        faturaUuid: uuid,
        matrah: stringOrNumber(numberToString, 1),
        aliciAdi: 'buyerFirstName',
        aliciSoyadi: 'buyerLastName',
        sehir: 'city',
        mahalleSemtIlce: 'district',
        vergilerDahilToplamTutar: stringOrNumber(numberToString, 2),
        odenecekTutar: stringOrNumber(numberToString, 3),
        malHizmetTable: [
          {
            malHizmet: 'Test Ürün',
            fiyat: stringOrNumber(numberToString, 1),
            vergiOrani: 2,
            miktar: 3,
            birimFiyat: stringOrNumber(numberToString, 4),
            malHizmetTutari: stringOrNumber(numberToString, 5),
            kdvOrani: stringOrNumber(numberToString, 6),
            kdvTutari: stringOrNumber(numberToString, 7),
            vergininKdvTutari: stringOrNumber(numberToString, 8),
            birim: EInvoiceUnitType.ADET,
            ozelMatrahTutari: stringOrNumber(numberToString, 9),
            iskontoArttm: 'İskonto',
            iskontoOrani: 10,
            iskontoTutari: stringOrNumber(numberToString, 11),
            iskontoNedeni: 'discountOrIncrementReason'
          }
        ],
        malhizmetToplamTutari: stringOrNumber(numberToString, 4),
        aliciUnvan: 'buyerTitle',
        binaAdi: 'buildingName',
        binaNo: 'buildingNumber',
        hesaplanankdv: stringOrNumber(numberToString, 5),
        ulke: EInvoiceCountry.ALMANYA,
        paraBirimi: EInvoiceCurrencyType.EURO,
        dovzTLkur: stringOrNumber(numberToString, 19),
        faturaTarihi: getDateFormat(date),
        belgeNumarasi: 'documentNumber',
        kapiNo: 'doorNumber',
        eposta: 'email',
        fax: 'faxNumber',
        bulvarcaddesokak: 'fullAddress',
        faturaTipi: InvoiceType.IADE,
        not: 'Yalnız Üç TL',
        okcSeriNo: 'okcSerialNumber',
        siparisTarihi: getDateFormat(date),
        siparisNumarasi: 'orderNumber',
        tel: 'phoneNumber',
        postaKodu: 'postNumber',
        fisTarihi: getDateFormat(date),
        fisNo: 'receiptNumber',
        fisSaati: '16:00',
        fisTipi: 'receiptType',
        iadeTable: [
          {
            faturaNo: 'invoiceNumber',
            duzenlenmeTarihi: getDateFormat(date)
          }
        ],
        ozelMatrahTutari: stringOrNumber(numberToString, 6),
        ozelMatrahOrani: 7,
        ozelMatrahVergiTutari: stringOrNumber(numberToString, 8),
        vergiDairesi: 'taxOffice',
        vknTckn: 'taxOrIdentityNumber',
        vergiCesidi: 'taxType',
        saat: getDateFormat(date, 'time'),
        toplamIskonto: stringOrNumber(numberToString, 9),
        vergilerToplami: stringOrNumber(numberToString, 10),
        kasabaKoy: 'town',
        tip: 'type',
        irsaliyeTarihi: getDateFormat(date),
        irsaliyeNumarasi: 'waybillNumber',
        websitesi: 'website',
        hangiTip: 'whichType',
        zRaporNo: 'zReportNumber'
      },
      custom
    )
  }

  return deepMerge(
    {
      uuid,
      base: stringOrNumber(numberToString, 1),
      buyerTitle: 'buyerTitle',
      buyerFirstName: 'buyerFirstName',
      buyerLastName: 'buyerLastName',
      city: 'city',
      district: 'district',
      includedTaxesTotalPrice: stringOrNumber(numberToString, 2),
      paymentPrice: stringOrNumber(numberToString, 3),
      products: [
        {
          name: 'Test Ürün',
          price: stringOrNumber(numberToString, 1),
          taxRate: 2,
          quantity: 3,
          unitPrice: stringOrNumber(numberToString, 4),
          totalAmount: stringOrNumber(numberToString, 5),
          vatRate: stringOrNumber(numberToString, 6),
          vatAmount: stringOrNumber(numberToString, 7),
          vatAmountOfTax: stringOrNumber(numberToString, 8),
          unitType: EInvoiceUnitType.ADET,
          specialBaseAmount: stringOrNumber(numberToString, 9),
          discountOrIncrement: 'İskonto',
          discountOrIncrementRate: 10,
          discountOrIncrementReason: 'discountOrIncrementReason',
          discountOrIncrementAmount: stringOrNumber(numberToString, 11)
        }
      ],
      productsTotalPrice: stringOrNumber(numberToString, 4),
      buildingName: 'buildingName',
      buildingNumber: 'buildingNumber',
      calculatedVAT: stringOrNumber(numberToString, 5),
      country: EInvoiceCountry.ALMANYA,
      currency: EInvoiceCurrencyType.EURO,
      currencyRate: stringOrNumber(numberToString, 19),
      date: getDateFormat(date),
      documentNumber: 'documentNumber',
      doorNumber: 'doorNumber',
      email: 'email',
      faxNumber: 'faxNumber',
      fullAddress: 'fullAddress',
      invoiceType: InvoiceType.IADE,
      note: 'Yalnız Üç TL',
      okcSerialNumber: 'okcSerialNumber',
      orderDate: getDateFormat(date),
      orderNumber: 'orderNumber',
      phoneNumber: 'phoneNumber',
      postNumber: 'postNumber',
      receiptDate: getDateFormat(date),
      receiptNumber: 'receiptNumber',
      receiptTime: '16:00',
      receiptType: 'receiptType',
      refundTable: [
        {
          invoiceNumber: 'invoiceNumber',
          date: getDateFormat(date)
        }
      ],
      specialBaseAmount: stringOrNumber(numberToString, 6),
      specialBasePercent: 7,
      specialBaseTaxAmount: stringOrNumber(numberToString, 8),
      taxOffice: 'taxOffice',
      taxOrIdentityNumber: 'taxOrIdentityNumber',
      taxType: 'taxType',
      time: getDateFormat(date, 'time'),
      totalDiscountOrIncrement: stringOrNumber(numberToString, 9),
      totalTaxes: stringOrNumber(numberToString, 10),
      town: 'town',
      type: 'type',
      waybillDate: getDateFormat(date),
      waybillNumber: 'waybillNumber',
      website: 'website',
      whichType: 'whichType',
      zReportNumber: 'zReportNumber'
    },
    custom
  )
}

export default generateMockInvoice
