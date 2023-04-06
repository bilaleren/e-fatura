import { v1 as uuidV1 } from 'uuid'
import EInvoiceError from '../../errors/EInvoiceError'
import mappingInvoiceKeys from '../../utils/mappingInvoiceKeys'
import generateMockInvoice from '../../utils/test/generateMockInvoice'

describe('mappingInvoiceKeys()', () => {
  it('Fatura verisi obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingInvoiceKeys('')
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingInvoiceKeys(0)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingInvoiceKeys(null)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingInvoiceKeys(undefined)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingInvoiceKeys(false)
    }).toThrow(EInvoiceError)
  })

  it('Fatura verisini ingilizce anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1()
    const date = new Date()
    const invoicePayload = generateMockInvoice({
      uuid,
      date,
      mappingWithTurkishKeys: true
    })

    expect(mappingInvoiceKeys(invoicePayload)).toStrictEqual(
      generateMockInvoice({
        uuid,
        date
      })
    )
  })
})
