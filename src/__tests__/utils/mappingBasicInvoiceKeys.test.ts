import { v1 as uuidV1 } from 'uuid'
import EInvoiceError from '../../errors/EInvoiceError'
import mappingBasicInvoiceKeys from '../../utils/mappingBasicInvoiceKeys'
import generateMockBasicInvoice from '../../utils/test/generateMockBasicInvoice'

describe('mappingInvoiceKeys()', () => {
  it('Fatura bir obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingBasicInvoiceKeys('')
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingBasicInvoiceKeys(0)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingBasicInvoiceKeys(null)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingBasicInvoiceKeys(undefined)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingBasicInvoiceKeys(false)
    }).toThrow(EInvoiceError)
  })

  it('Fatura anahtarlarını ingilizce anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1()
    const invoice = generateMockBasicInvoice({
      uuid,
      mappingWithTurkishKeys: true
    })

    expect(mappingBasicInvoiceKeys(invoice)).toStrictEqual(
      generateMockBasicInvoice({
        uuid
      })
    )
  })

  it('Fatura anahtarlarını türkçe anahtarlar ile değiştirmeli.', () => {
    const uuid = uuidV1()
    const invoice = generateMockBasicInvoice({
      uuid
    })

    expect(mappingBasicInvoiceKeys(invoice, true)).toStrictEqual(
      generateMockBasicInvoice({
        uuid,
        mappingWithTurkishKeys: true
      })
    )
  })
})
