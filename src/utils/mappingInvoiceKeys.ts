import isPlainObject from './isPlainObject'
import { EInvoiceTypeError } from '../errors'

function mappingInvoiceKeys(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new EInvoiceTypeError('Geçersiz fatura verisi.')
  }

  const {
    matrah = 0,
    binaAdi = '',
    binaNo = '',
    aliciAdi = '',
    aliciSoyadi = '',
    aliciUnvan = '',
    hesaplanankdv = 0,
    sehir = '',
    ulke = '',
    paraBirimi = '',
    dovzTLkur = 0,
    faturaTarihi = '',
    mahalleSemtIlce = '',
    belgeNumarasi = '',
    kapiNo = '',
    eposta = '',
    fax = '',
    bulvarcaddesokak = '',
    vergilerDahilToplamTutar = 0,
    faturaTipi = '',
    not = '',
    okcSeriNo,
    siparisTarihi,
    siparisNumarasi,
    odenecekTutar = 0,
    tel = '',
    postaKodu = '',
    malHizmetTable = [],
    malhizmetToplamTutari = 0,
    fisTarihi,
    fisNo,
    fisSaati,
    fisTipi,
    iadeTable,
    ozelMatrahTutari = 0,
    ozelMatrahOrani = 0,
    ozelMatrahVergiTutari = 0,
    vergiDairesi = '',
    vknTckn = '',
    vergiCesidi,
    saat = '',
    toplamIskonto = 0,
    vergilerToplami = 0,
    kasabaKoy = '',
    tip = '',
    faturaUuid = '',
    irsaliyeTarihi,
    irsaliyeNumarasi,
    websitesi = '',
    hangiTip,
    zRaporNo,
    ...other
  } = value

  return {
    ...other,
    base: matrah,
    buildingName: binaAdi,
    buildingNumber: binaNo,
    buyerFirstName: aliciAdi,
    buyerLastName: aliciSoyadi,
    buyerTitle: aliciUnvan,
    calculatedVAT: hesaplanankdv,
    city: sehir,
    country: ulke,
    currency: paraBirimi,
    currencyRate: dovzTLkur,
    date: faturaTarihi,
    district: mahalleSemtIlce,
    documentNumber: belgeNumarasi,
    doorNumber: kapiNo,
    email: eposta,
    faxNumber: fax,
    fullAddress: bulvarcaddesokak,
    includedTaxesTotalPrice: vergilerDahilToplamTutar,
    invoiceType: faturaTipi,
    note: not,
    okcSerialNumber: okcSeriNo,
    orderDate: siparisTarihi,
    orderNumber: siparisNumarasi,
    paymentPrice: odenecekTutar,
    phoneNumber: tel,
    postNumber: postaKodu,
    products: malHizmetTable.map((product: Record<string, unknown>) => {
      const {
        iskontoArttm = '',
        iskontoTutari = 0,
        iskontoOrani = 0,
        iskontoNedeni = '',
        malHizmet = '',
        fiyat = 0,
        miktar = 0,
        ozelMatrahTutari = 0,
        vergiOrani = 0,
        malHizmetTutari = 0,
        birimFiyat = 0,
        birim = '',
        kdvTutari = 0,
        vergininKdvTutari = 0,
        kdvOrani = 0,
        ...other
      } = product

      return {
        ...other,
        discountOrIncrement: iskontoArttm,
        discountOrIncrementAmount: iskontoTutari,
        discountOrIncrementRate: iskontoOrani,
        discountOrIncrementReason: iskontoNedeni,
        name: malHizmet,
        price: fiyat,
        quantity: miktar,
        specialBaseAmount: ozelMatrahTutari,
        taxRate: vergiOrani,
        totalAmount: malHizmetTutari,
        unitPrice: birimFiyat,
        unitType: birim,
        vatAmount: kdvTutari,
        vatAmountOfTax: vergininKdvTutari,
        vatRate: kdvOrani
      }
    }),
    productsTotalPrice: malhizmetToplamTutari,
    receiptDate: fisTarihi,
    receiptNumber: fisNo,
    receiptTime: fisSaati,
    receiptType: fisTipi,
    refundTable: Array.isArray(iadeTable)
      ? iadeTable.map((item: Record<string, unknown>) => {
          const { faturaNo = '', duzenlenmeTarihi = '', ...other } = item

          return {
            ...other,
            invoiceNumber: faturaNo,
            date: duzenlenmeTarihi
          }
        })
      : undefined,
    specialBaseAmount: ozelMatrahTutari,
    specialBasePercent: ozelMatrahOrani,
    specialBaseTaxAmount: ozelMatrahVergiTutari,
    taxOffice: vergiDairesi,
    taxOrIdentityNumber: vknTckn,
    taxType: vergiCesidi,
    time: saat,
    totalDiscountOrIncrement: toplamIskonto,
    totalTaxes: vergilerToplami,
    town: kasabaKoy,
    type: tip,
    uuid: faturaUuid,
    waybillDate: irsaliyeTarihi,
    waybillNumber: irsaliyeNumarasi,
    website: websitesi,
    whichType: hangiTip,
    zReportNumber: zRaporNo
  }
}

export default mappingInvoiceKeys
