import { v1 as uuidV1, validate as validateUuid } from 'uuid'
import isPlainObject from './isPlainObject'
import numberToText from 'number-to-text'
import getDateFormat from './getDateFormat'
import InvoiceType from '../enums/InvoiceType'
import EInvoiceTypeError from '../errors/EInvoiceTypeError'
import { isRequired, isLessThan } from './validation'
import EInvoiceCountry from '../enums/EInvoiceCountry'
import EInvoiceUnitType from '../enums/EInvoiceUnitType'
import EInvoiceCurrencyType from '../enums/EInvoiceCurrencyType'
import type { RefundInvoice, CreateDraftInvoicePayload } from '../types'

import 'number-to-text/converters/tr'

function convertPriceToText(value: unknown): string {
  if (typeof value !== 'number') {
    return ''
  }

  const [main, sub] = value.toFixed(2).split('.')

  const texts: string[] = [
    'Yalnız',
    numberToText.convertToText(+main, {
      case: 'titleCase',
      language: 'tr'
    }),
    'TL'
  ]

  if (sub !== '00') {
    texts.push(
      numberToText.convertToText(+sub, {
        case: 'titleCase',
        language: 'tr'
      }),
      'Kuruş'
    )
  }

  return texts.join(' ')
}

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

  isLessThan(base, 1, 'base')
  isLessThan(paymentPrice, 1, 'paymentPrice')
  isLessThan(productsTotalPrice, 1, 'productsTotalPrice')
  isLessThan(includedTaxesTotalPrice, 1, 'includedTaxesTotalPrice')

  return {
    ...other,
    faturaUuid: uuid,
    belgeNumarasi: documentNumber,
    faturaTarihi: getDateFormat(date),
    saat: getDateFormat(time, 'time'),
    paraBirimi: currency,
    dovzTLkur: currencyRate.toFixed(2),
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

      isRequired(invoiceNumber, `refundTable[${index}].invoiceNumber`)

      return {
        ...other,
        faturaNo: invoiceNumber,
        duzenlenmeTarihi: getDateFormat(date)
      }
    }),
    ozelMatrahTutari: specialBaseAmount.toFixed(2),
    ozelMatrahOrani: specialBasePercent,
    ozelMatrahVergiTutari: specialBaseTaxAmount.toFixed(2),
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

      isRequired(name, `products[${index}].name`)

      isLessThan(price, 1, `products[${index}].price`)
      isLessThan(quantity, 1, `products[${index}].quantity`)
      isLessThan(unitPrice, 1, `products[${index}].unitPrice`)
      isLessThan(totalAmount, 1, `products[${index}].totalAmount`)

      return {
        ...other,
        malHizmet: name,
        miktar: quantity,
        birim: unitType,
        birimFiyat: unitPrice.toFixed(2),
        fiyat: price.toFixed(2),
        iskontoArttm: discountOrIncrement,
        iskontoOrani: discountOrIncrementRate,
        iskontoTutari: discountOrIncrementAmount.toFixed(2),
        iskontoNedeni: discountOrIncrementReason,
        malHizmetTutari: totalAmount.toFixed(2),
        kdvOrani: vatRate.toFixed(0),
        kdvTutari: vatAmount.toFixed(2),
        vergiOrani: taxRate,
        vergininKdvTutari: vatAmountOfTax.toFixed(2),
        ozelMatrahTutari: specialBaseAmount.toFixed(2)
      }
    }),
    tip: type,
    matrah: base.toFixed(2),
    malhizmetToplamTutari: productsTotalPrice.toFixed(2),
    toplamIskonto: totalDiscountOrIncrement.toFixed(2),
    hesaplanankdv: calculatedVAT.toFixed(2),
    vergilerToplami: totalTaxes.toFixed(2),
    vergilerDahilToplamTutar: includedTaxesTotalPrice.toFixed(2),
    odenecekTutar: paymentPrice.toFixed(2),
    not: note || convertPriceToText(paymentPrice),
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
