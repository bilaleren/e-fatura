import { validate as validateUuid } from 'uuid'
import uuidV1 from './uuidV1'
import isPlainObject from './isPlainObject'
import getDateFormat from './getDateFormat'
import paymentPriceToText from './paymentPriceToText'
import { EInvoiceTypeError } from '../errors'
import {
  InvoiceType,
  EInvoiceCountry,
  EInvoiceUnitType,
  EInvoiceCurrencyType
} from '../enums'
import { greaterThanValidator, notEmptyStringValidator } from './validators'
import type { RefundInvoice, CreateDraftInvoicePayload } from '../types'

function mappingDraftInvoiceKeys(
  payload: CreateDraftInvoicePayload
): Record<string, unknown> {
  if (!isPlainObject(payload)) {
    throw new EInvoiceTypeError('Geçersiz fatura yükü.')
  }

  const {
    uuid = uuidV1(),
    documentNumber = '',
    date,
    time,
    currency = EInvoiceCurrencyType.TURK_LIRASI,
    currencyRate = 0,
    invoiceType = InvoiceType.SATIS,
    whichType = '5000/30000',
    taxOrIdentityNumber = '11111111111',
    buyerTitle = '',
    buyerFirstName = '',
    buyerLastName = '',
    buildingName = '',
    buildingNumber = '',
    doorNumber = '',
    town = '',
    taxOffice = '',
    country = EInvoiceCountry.TURKIYE,
    fullAddress = '',
    district = '',
    city = '',
    postNumber = '',
    phoneNumber = '',
    faxNumber = '',
    email = '',
    website = '',
    refundTable = [] as RefundInvoice[],
    specialBaseAmount = 0,
    specialBasePercent = 0,
    specialBaseTaxAmount = 0,
    taxType = ' ',
    products,
    type = 'İskonto',
    base,
    productsTotalPrice,
    totalDiscountOrIncrement = 0,
    calculatedVAT = 0,
    totalTaxes = 0,
    includedTaxesTotalPrice,
    paymentPrice,
    note = '',
    orderNumber = '',
    orderDate = '',
    waybillNumber = '',
    waybillDate = '',
    receiptNumber = '',
    receiptDate = '',
    receiptTime = '',
    receiptType = '',
    zReportNumber = '',
    okcSerialNumber = '',
    ...other
  } = payload

  if (!validateUuid(uuid)) {
    throw new EInvoiceTypeError("Geçersiz fatura UUID'i.")
  }

  greaterThanValidator(base, 0, 'base')
  greaterThanValidator(paymentPrice, 0, 'paymentPrice')
  greaterThanValidator(productsTotalPrice, 0, 'productsTotalPrice')
  greaterThanValidator(includedTaxesTotalPrice, 0, 'includedTaxesTotalPrice')

  return {
    ...other,
    faturaUuid: uuid,
    belgeNumarasi: documentNumber,
    faturaTarihi: getDateFormat(date),
    saat: getDateFormat(time, 'time'),
    paraBirimi: currency,
    dovzTLkur: currencyRate.toString(),
    faturaTipi: invoiceType,
    hangiTip: whichType,
    vknTckn: taxOrIdentityNumber,
    aliciUnvan: buyerTitle,
    aliciAdi: buyerFirstName,
    aliciSoyadi: buyerLastName,
    binaAdi: buildingName,
    binaNo: buildingNumber,
    kapiNo: doorNumber,
    kasabaKoy: town,
    vergiDairesi: taxOffice,
    ulke: country,
    mahalleSemtIlce: district,
    bulvarcaddesokak: fullAddress,
    sehir: city,
    postaKodu: postNumber,
    tel: phoneNumber,
    fax: faxNumber,
    eposta: email,
    websitesi: website,
    iadeTable: refundTable.map((refund, index) => {
      const { invoiceNumber, date, ...other } = refund

      notEmptyStringValidator(
        invoiceNumber,
        `refundTable[${index}].invoiceNumber`
      )

      return {
        ...other,
        faturaNo: invoiceNumber,
        duzenlenmeTarihi: getDateFormat(date)
      }
    }),
    ozelMatrahTutari: specialBaseAmount.toString(),
    ozelMatrahOrani: specialBasePercent,
    ozelMatrahVergiTutari: specialBaseTaxAmount.toString(),
    vergiCesidi: taxType,
    malHizmetTable: products.map((product, index) => {
      const {
        name,
        quantity = 1,
        unitType = EInvoiceUnitType.ADET,
        unitPrice,
        price,
        vatRate = 0,
        taxRate = 0,
        totalAmount,
        vatAmount = 0,
        vatAmountOfTax = 0,
        specialBaseAmount = 0,
        discountOrIncrement = 'İskonto',
        discountOrIncrementRate = 0,
        discountOrIncrementAmount = 0,
        discountOrIncrementReason = '',
        ...other
      } = product

      notEmptyStringValidator(name, `products[${index}].name`)

      greaterThanValidator(price, 0, `products[${index}].price`)
      greaterThanValidator(quantity, 0, `products[${index}].quantity`)
      greaterThanValidator(unitPrice, 0, `products[${index}].unitPrice`)
      greaterThanValidator(totalAmount, 0, `products[${index}].totalAmount`)

      return {
        ...other,
        malHizmet: name,
        miktar: quantity,
        birim: unitType,
        birimFiyat: unitPrice.toString(),
        fiyat: price.toString(),
        iskontoArttm: discountOrIncrement,
        iskontoOrani: discountOrIncrementRate,
        iskontoTutari: discountOrIncrementAmount.toString(),
        iskontoNedeni: discountOrIncrementReason,
        malHizmetTutari: totalAmount.toString(),
        kdvOrani: vatRate.toString(),
        kdvTutari: vatAmount.toString(),
        vergiOrani: taxRate,
        vergininKdvTutari: vatAmountOfTax.toString(),
        ozelMatrahTutari: specialBaseAmount.toString()
      }
    }),
    tip: type,
    matrah: base.toString(),
    malhizmetToplamTutari: productsTotalPrice.toString(),
    toplamIskonto: totalDiscountOrIncrement.toString(),
    hesaplanankdv: calculatedVAT.toString(),
    vergilerToplami: totalTaxes.toString(),
    vergilerDahilToplamTutar: includedTaxesTotalPrice.toString(),
    odenecekTutar: paymentPrice.toString(),
    not: note || `YALNIZ ${paymentPriceToText(paymentPrice)}`,
    siparisNumarasi: orderNumber,
    siparisTarihi: orderDate ? getDateFormat(orderDate) : '',
    irsaliyeNumarasi: waybillNumber,
    irsaliyeTarihi: waybillDate ? getDateFormat(waybillDate) : '',
    fisNo: receiptNumber,
    fisTarihi: receiptDate ? getDateFormat(receiptDate) : '',
    fisSaati: receiptTime,
    fisTipi: receiptType,
    zRaporNo: zReportNumber,
    okcSeriNo: okcSerialNumber
  }
}

export default mappingDraftInvoiceKeys
