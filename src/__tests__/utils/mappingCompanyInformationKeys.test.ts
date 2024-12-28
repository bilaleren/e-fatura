import { EInvoiceTypeError } from '../../errors'
import { mappingCompanyInformationKeys } from '../../utils'

describe('mappingCompanyInformationKeys()', () => {
  it('Şirket bilgileri obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingCompanyInformationKeys('')
    }).toThrow(EInvoiceTypeError)

    expect(() => {
      mappingCompanyInformationKeys(0)
    }).toThrow(EInvoiceTypeError)

    expect(() => {
      mappingCompanyInformationKeys(null)
    }).toThrow(EInvoiceTypeError)

    expect(() => {
      mappingCompanyInformationKeys(undefined)
    }).toThrow(EInvoiceTypeError)

    expect(() => {
      mappingCompanyInformationKeys(false)
    }).toThrow(EInvoiceTypeError)
  })

  it('Şirket bilgileri anahtarlarını ingilizce anahtarlar ile değiştirmeli.', () => {
    const companyInformation = mappingCompanyInformationKeys({
      unvan: 'unvan',
      adi: 'adi',
      soyadi: 'soyadi',
      vergiDairesi: 'vergiDairesi'
    })

    expect(companyInformation).toStrictEqual({
      title: 'unvan',
      firstName: 'adi',
      lastName: 'soyadi',
      taxOffice: 'vergiDairesi'
    })
  })

  it('Şirket bilgileri anahtarlarını türkçe anahtarlar ile değiştirmeli.', () => {
    const companyInformation = mappingCompanyInformationKeys(
      {
        title: 'title',
        firstName: 'firstName',
        lastName: 'lastName',
        taxOffice: 'taxOffice'
      },
      true
    )

    expect(companyInformation).toStrictEqual({
      unvan: 'title',
      adi: 'firstName',
      soyadi: 'lastName',
      vergiDairesi: 'taxOffice'
    })
  })
})
