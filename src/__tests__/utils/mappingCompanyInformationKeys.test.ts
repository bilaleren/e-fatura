import EInvoiceError from '../../errors/EInvoiceError'
import mappingCompanyInformationKeys from '../../utils/mappingCompanyInformationKeys'

describe('mappingCompanyInformationKeys()', () => {
  it('Şirket bilgileri obje olmadığında hata fırlatmalı.', () => {
    expect(() => {
      mappingCompanyInformationKeys('')
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingCompanyInformationKeys(0)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingCompanyInformationKeys(null)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingCompanyInformationKeys(undefined)
    }).toThrow(EInvoiceError)

    expect(() => {
      mappingCompanyInformationKeys(false)
    }).toThrow(EInvoiceError)
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
