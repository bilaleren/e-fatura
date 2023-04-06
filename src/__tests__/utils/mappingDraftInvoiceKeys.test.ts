import { v1 as uuidV1 } from 'uuid'
import EInvoiceError from '../../errors/EInvoiceError'
import type { CreateDraftInvoicePayload } from '../../types'
import generateMockInvoice from '../../utils/test/generateMockInvoice'
import mappingDraftInvoiceKeys from '../../utils/mappingDraftInvoiceKeys'

describe('mappingDraftInvoiceKeys()', () => {
  it('Fatura verisi obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingDraftInvoiceKeys('' as unknown as CreateDraftInvoicePayload)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingDraftInvoiceKeys(0 as unknown as CreateDraftInvoicePayload)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingDraftInvoiceKeys(null as unknown as CreateDraftInvoicePayload)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingDraftInvoiceKeys(undefined as unknown as CreateDraftInvoicePayload)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingDraftInvoiceKeys(false as unknown as CreateDraftInvoicePayload)
    }).toThrow(EInvoiceError)
  })

  it("Geçersiz bir fatura UUID'i belirtildiğinde hata fırlatmalı.", () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        uuid: '',
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow(EInvoiceError)
  })

  it(`"base" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 0,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"base"')
  })

  it(`"includedTaxesTotalPrice" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 0,
        paymentPrice: 1,
        products: [],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"includedTaxesTotalPrice"')
  })

  it(`"paymentPrice" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 0,
        products: [],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"paymentPrice"')
  })

  it(`"productsTotalPrice" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [],
        productsTotalPrice: 0,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"productsTotalPrice"')
  })

  it('"refundTable.$.invoiceNumber" alanı boş olduğunda hata fırlatmalı.', () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [],
        refundTable: [
          {
            invoiceNumber: ''
          }
        ],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"refundTable[0].invoiceNumber"')
  })

  it('"products.$.name" alanı boş olduğunda hata fırlatmalı.', () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [
          {
            name: '',
            price: 1,
            unitPrice: 1,
            totalAmount: 1
          }
        ],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"products[0].name"')
  })

  it(`"products.$.price" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [
          {
            name: 'Test Ürün',
            price: 0,
            unitPrice: 1,
            totalAmount: 1
          }
        ],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"products[0].price"')
  })

  it(`"products.$.unitPrice" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [
          {
            name: 'Test Ürün',
            price: 1,
            unitPrice: 0,
            totalAmount: 1
          }
        ],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"products[0].unitPrice"')
  })

  it(`"products.$.totalAmount" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [
          {
            name: 'Test Ürün',
            price: 1,
            unitPrice: 1,
            totalAmount: 0
          }
        ],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"products[0].totalAmount"')
  })

  it(`"products.$.quantity" alanı 1'den küçük olduğunda hata fırlatmalı.`, () => {
    expect(() => {
      mappingDraftInvoiceKeys({
        base: 1,
        buyerFirstName: 'Bilal',
        buyerLastName: 'Eren',
        city: 'İstanbul',
        district: 'Kağıthane',
        includedTaxesTotalPrice: 1,
        paymentPrice: 1,
        products: [
          {
            name: 'Test Ürün',
            price: 1,
            quantity: 0,
            unitPrice: 1,
            totalAmount: 1
          }
        ],
        productsTotalPrice: 1,
        buyerTitle: 'Bilal Eren'
      })
    }).toThrow('"products[0].quantity"')
  })

  it('Fatura verisini türkçe anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1()
    const date = new Date()
    const invoicePayload = generateMockInvoice({
      uuid,
      date
    }) as CreateDraftInvoicePayload

    expect(mappingDraftInvoiceKeys(invoicePayload)).toStrictEqual(
      generateMockInvoice({
        uuid,
        date,
        numberToString: true,
        mappingWithTurkishKeys: true
      })
    )
  })
})
