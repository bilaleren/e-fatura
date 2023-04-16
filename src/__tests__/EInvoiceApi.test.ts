import axios from 'axios'
import { v1 as uuidV1 } from 'uuid'
import qs from 'node:querystring'
import EInvoiceApi from '../EInvoiceApi'
import getDateFormat from '../utils/getDateFormat'
import EInvoiceError from '../errors/EInvoiceError'
import EInvoiceCountry from '../enums/EInvoiceCountry'
import puppeteer, { Browser, Page } from 'puppeteer'
import type {
  BasicInvoice,
  UserInformation,
  CompanyInformation,
  CreateDraftInvoicePayload,
  UpdateDraftInvoicePayload
} from '../types'
import EInvoiceApiError from '../errors/EInvoiceApiError'
import mappingInvoiceKeys from '../utils/mappingInvoiceKeys'
import EInvoiceApiErrorCode from '../enums/EInvoiceApiErrorCode'
import InvoiceApprovalStatus from '../enums/InvoiceApprovalStatus'
import generateMockInvoice from '../utils/test/generateMockInvoice'
import generateMockInvoices from '../utils/test/generateMockInvoices'
import mappingDraftInvoiceKeys from '../utils/mappingDraftInvoiceKeys'
import mappingBasicInvoiceKeys from '../utils/mappingBasicInvoiceKeys'
import mappingUserInformationKeys from '../utils/mappingUserInformationKeys'
import generateMockBasicInvoice from '../utils/test/generateMockBasicInvoice'
import mappingCompanyInformationKeys from '../utils/mappingCompanyInformationKeys'

jest.mock('axios')
jest.mock('puppeteer')

const mockedAxios = jest.mocked(axios)
const mockedPuppeteer = jest.mocked(puppeteer)

function removeCallIdFromParams(value: unknown): qs.ParsedUrlQuery {
  if (typeof value !== 'string') {
    return {}
  }

  const params = qs.parse(value)

  delete params.callid

  return params
}

describe('EInvoiceApi', () => {
  let EInvoice: EInvoiceApi

  beforeEach(() => {
    EInvoice = new EInvoiceApi()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('common', () => {
    it('1. e-Arşiv API hataları yakalanmalı.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      mockedAxios.post.mockImplementation(() => {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          data: null,
          status: 500
        })
      })

      try {
        await EInvoice.getBasicInvoices()
        expect(true).toBeFalsy()
      } catch (e) {
        const error = e as EInvoiceApiError

        expect(error).toBeInstanceOf(EInvoiceApiError)
        expect(error.getResponse()).toEqual({
          data: undefined,
          errorCode: EInvoiceApiErrorCode.INVALID_RESPONSE,
          httpStatusCode: 500,
          httpStatusText: 'Unknown'
        })
      }

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )
    })

    it('2. e-Arşiv API hataları yakalanmalı.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            error: '1',
            messages: []
          },
          status: 200,
          statusText: 'Success'
        })
      })

      try {
        await EInvoice.getBasicInvoices()
        expect(true).toBeFalsy()
      } catch (e) {
        const error = e as EInvoiceApiError

        expect(error).toBeInstanceOf(EInvoiceApiError)
        expect(error.getResponse()).toEqual({
          data: {
            error: '1',
            messages: []
          },
          errorCode: EInvoiceApiErrorCode.SERVER_ERROR,
          httpStatusCode: 200,
          httpStatusText: 'Success'
        })
      }
    })
  })

  describe('setToken() & getToken()', () => {
    it('getToken metodu mevcut erişim jetonunu döndürmeli.', () => {
      expect(EInvoice.setToken('testToken')).toBeInstanceOf(EInvoiceApi)
      expect(EInvoice.getToken()).toBe('testToken')
    })
  })

  describe('setTestMode & getTestMode()', () => {
    it('Test modu aktif/deaktif edilmeli.', () => {
      expect(EInvoice.getTestMode()).toBeFalsy()
      expect(EInvoice.setTestMode(true)).toBeInstanceOf(EInvoiceApi)
      expect(EInvoice.getTestMode()).toBeTruthy()
    })
  })

  describe('setCredentials() & getCredentials()', () => {
    it('Kullanıcı adı atamalı.', () => {
      expect(
        EInvoice.setCredentials({
          username: 'testUsername'
        })
      ).toBeInstanceOf(EInvoiceApi)

      expect(EInvoice.getCredentials()).toStrictEqual({
        username: 'testUsername',
        password: null
      })
    })

    it('Şifre atamalı.', () => {
      expect(
        EInvoice.setCredentials({
          password: 'testPassword'
        })
      ).toBeInstanceOf(EInvoiceApi)

      expect(EInvoice.getCredentials()).toEqual({
        username: null,
        password: 'testPassword'
      })
    })

    it('Kullanıcı adı ve şifre atamalı.', () => {
      expect(
        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })
      ).toBeInstanceOf(EInvoiceApi)

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      })
    })

    it('Kullanıcı adı ve şifre null ile değiştirilebilir.', () => {
      EInvoice.setCredentials({
        username: 'testUsername',
        password: 'testPassword'
      })

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      })

      EInvoice.setCredentials({
        username: null,
        password: null
      })

      expect(EInvoice.getCredentials()).toEqual({
        username: null,
        password: null
      })
    })

    it('Kullanıcı adı ve şifre undefined ile değiştirilemez.', () => {
      EInvoice.setCredentials({
        username: 'testUsername',
        password: 'testPassword'
      })

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      })

      EInvoice.setCredentials({
        username: undefined,
        password: undefined
      })

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      })
    })
  })

  describe('getAccessToken()', () => {
    it('Kullanıcı adı ve şifre belirtilmeiğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getAccessToken()).rejects.toThrow(EInvoiceError)
    })

    describe('setTestMode(true)', () => {
      it("e-Arşiv'e bağlanmak için erişim jetonu almalı.", async () => {
        EInvoice.setTestMode(true)

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })

        const testToken = 'testToken'

        mockedAxios.post.mockImplementation(() => {
          return Promise.resolve({
            data: {
              token: testToken
            }
          })
        })

        const token = await EInvoice.getAccessToken()
        const credentials = EInvoice.getCredentials()

        expect(token).toBe(testToken)
        expect(EInvoice.getToken()).toBe(testToken)
        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.TOKEN_PATH
        )
        expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
          qs.stringify({
            assoscmd: 'login',
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1'
          })
        )
        expect(mockedAxios.post.mock.calls?.[0]?.[2]?.baseURL).toBe(
          EInvoiceApi.TEST_BASE_URL
        )
      })

      it('Erişim jetonu "null" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(true)

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })

        const credentials = EInvoice.getCredentials()

        mockedAxios.post.mockImplementation(() => {
          return Promise.resolve({
            data: {
              token: null
            }
          })
        })

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.TOKEN_PATH
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
          qs.stringify({
            assoscmd: 'login',
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1'
          })
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[2]?.baseURL).toBe(
          EInvoiceApi.TEST_BASE_URL
        )
      })

      it('Erişim jetonu "boş bir dizi" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(true)

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })

        const credentials = EInvoice.getCredentials()

        mockedAxios.post.mockImplementation(() => {
          return Promise.resolve({
            data: {
              token: ''
            }
          })
        })

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.TOKEN_PATH
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
          qs.stringify({
            assoscmd: 'login',
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1'
          })
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[2]?.baseURL).toBe(
          EInvoiceApi.TEST_BASE_URL
        )
      })
    })

    describe('setTestMode(false)', () => {
      it("e-Arşiv'e bağlanmak için erişim jetonu almalı.", async () => {
        EInvoice.setTestMode(false)

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })

        const testToken = 'testToken'

        mockedAxios.post.mockImplementation(() => {
          return Promise.resolve({
            data: {
              token: testToken
            }
          })
        })

        const token = await EInvoice.getAccessToken()
        const credentials = EInvoice.getCredentials()

        expect(token).toBe(testToken)
        expect(EInvoice.getToken()).toBe(testToken)
        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.TOKEN_PATH
        )
        expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
          qs.stringify({
            assoscmd: 'anologin',
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1'
          })
        )
        expect(mockedAxios.post.mock.calls?.[0]?.[2]?.baseURL).toBe(
          EInvoiceApi.BASE_URL
        )
      })

      it('Erişim jetonu "null" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(false)

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })

        const credentials = EInvoice.getCredentials()

        mockedAxios.post.mockImplementation(() => {
          return Promise.resolve({
            data: {
              token: null
            }
          })
        })

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.TOKEN_PATH
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
          qs.stringify({
            assoscmd: 'anologin',
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1'
          })
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[2]?.baseURL).toBe(
          EInvoiceApi.BASE_URL
        )
      })

      it('Erişim jetonu "boş bir dizi" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(false)

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })

        const credentials = EInvoice.getCredentials()

        mockedAxios.post.mockImplementation(() => {
          return Promise.resolve({
            data: {
              token: ''
            }
          })
        })

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.TOKEN_PATH
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
          qs.stringify({
            assoscmd: 'anologin',
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1'
          })
        )

        expect(mockedAxios.post.mock.calls?.[0]?.[2]?.baseURL).toBe(
          EInvoiceApi.BASE_URL
        )
      })
    })
  })

  describe('getInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getInvoice('')).rejects.toThrow(EInvoiceError)
    })

    it('Faturaya göre fatura getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const date = new Date()
      const mockInvoice = generateMockInvoice({
        uuid,
        date,
        mappingWithTurkishKeys: true
      })

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoice
          }
        })
      })

      const invoice = await EInvoice.getInvoice(
        generateMockBasicInvoice({
          uuid
        }) as BasicInvoice
      )

      expect(invoice).toStrictEqual(mappingInvoiceKeys(mockInvoice))

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_GETIR',
        pageName: 'RG_BASITFATURA',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid
        })
      })
    })

    it("Fatura UUID'ine göre faturayı getirmeli.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const date = new Date()
      const mockInvoice = generateMockInvoice({
        uuid,
        date,
        mappingWithTurkishKeys: true
      })

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoice
          }
        })
      })

      const invoice = await EInvoice.getInvoice(uuid)

      expect(invoice).toStrictEqual(
        generateMockInvoice({
          uuid,
          date
        })
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_GETIR',
        pageName: 'RG_BASITFATURA',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid
        })
      })
    })

    it('Fatura verisinde "hata" alanı olduğunda hata fırlatmalı.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const date = new Date()
      const mockInvoice = generateMockInvoice({
        uuid,
        date,
        mappingWithTurkishKeys: true
      })

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: {
              ...mockInvoice,
              hata: 'hata'
            }
          }
        })
      })

      await expect(() => EInvoice.getInvoice(uuid)).rejects.toThrow(
        EInvoiceApiError
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_GETIR',
        pageName: 'RG_BASITFATURA',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid
        })
      })
    })
  })

  describe('logout()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.logout()).rejects.toThrow(EInvoiceError)
    })

    it('e-Arşiv oturumunu sonlandırmalı.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      expect(EInvoice.getToken()).toBe(accessToken)

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: {}
          }
        })
      })

      const result = await EInvoice.logout()

      expect(result).toBeTruthy()
      expect(EInvoice.getToken()).toBeNull()
      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(EInvoiceApi.TOKEN_PATH)
      expect(mockedAxios.post.mock.calls?.[0]?.[1]).toBe(
        qs.stringify({
          assoscmd: 'logout',
          rtype: 'json',
          token: accessToken
        })
      )
    })
  })

  describe('getBasicInvoices()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getBasicInvoices()).rejects.toThrow(EInvoiceError)
    })

    it('Bugüne ait faturaları getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      const invoices = await EInvoice.getBasicInvoices()

      expect(invoices).toHaveLength(mockInvoices.length)

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceKeys(value))
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
        pageName: 'RG_BASITTASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          baslangic: getDateFormat(),
          bitis: getDateFormat(),
          hangiTip: '5000/30000',
          table: []
        })
      })
    })

    it('Belirli tarih aralığındaki faturaları getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 5)

      const endDate = new Date()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      const invoices = await EInvoice.getBasicInvoices({
        startDate,
        endDate
      })

      expect(invoices).toHaveLength(mockInvoices.length)

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceKeys(value))
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
        pageName: 'RG_BASITTASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          baslangic: getDateFormat(startDate),
          bitis: getDateFormat(endDate),
          hangiTip: '5000/30000',
          table: []
        })
      })
    })

    it('Faturaları "Onay Durumuna" göre filtrelemeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      async function expectInvoicesFromApprovalStatus(
        approvalStatus: InvoiceApprovalStatus
      ): Promise<void> {
        const invoices = await EInvoice.getBasicInvoices({
          approvalStatus
        })
        const filteredInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
          mockInvoices.map((value) => {
            return mappingBasicInvoiceKeys(value) as unknown as BasicInvoice
          }),
          approvalStatus
        )

        expect(filteredInvoices.length).toBeGreaterThan(0)

        expect(invoices).toEqual(filteredInvoices)

        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.DISPATCH_PATH
        )

        expect(
          removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
        ).toEqual({
          cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
          pageName: 'RG_BASITTASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            baslangic: getDateFormat(),
            bitis: getDateFormat(),
            hangiTip: '5000/30000',
            table: []
          })
        })
      }

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.APPROVED)

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.UNAPPROVED)

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.DELETED)
    })
  })

  describe('getBasicInvoicesIssuedToMe()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getBasicInvoicesIssuedToMe()).rejects.toThrow(
        EInvoiceError
      )
    })

    it('Bugüne ait faturaları getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      const invoices = await EInvoice.getBasicInvoicesIssuedToMe()

      expect(invoices).toHaveLength(mockInvoices.length)

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceKeys(value))
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
        pageName: 'RG_ALICI_TASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          baslangic: getDateFormat(),
          bitis: getDateFormat(),
          hangiTip: '5000/30000',
          table: []
        })
      })
    })

    it('Belirli tarih aralığındaki faturaları getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 5)

      const endDate = new Date()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      const invoices = await EInvoice.getBasicInvoicesIssuedToMe({
        startDate,
        endDate
      })

      expect(invoices).toHaveLength(mockInvoices.length)

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceKeys(value))
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
        pageName: 'RG_ALICI_TASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          baslangic: getDateFormat(startDate),
          bitis: getDateFormat(endDate),
          hangiTip: '5000/30000',
          table: []
        })
      })
    })

    it('Faturaları "Onay Durumuna" göre filtrelemeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      async function expectInvoicesFromApprovalStatus(
        approvalStatus: InvoiceApprovalStatus
      ): Promise<void> {
        const invoices = await EInvoice.getBasicInvoicesIssuedToMe({
          approvalStatus
        })
        const filteredInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
          mockInvoices.map((value) =>
            mappingBasicInvoiceKeys(value)
          ) as unknown as BasicInvoice[],
          approvalStatus
        )

        expect(filteredInvoices.length).toBeGreaterThan(0)

        expect(invoices).toEqual(filteredInvoices)

        expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
          EInvoiceApi.DISPATCH_PATH
        )

        expect(
          removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
        ).toEqual({
          cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
          pageName: 'RG_ALICI_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            baslangic: getDateFormat(),
            bitis: getDateFormat(),
            hangiTip: '5000/30000',
            table: []
          })
        })
      }

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.APPROVED)

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.UNAPPROVED)

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.DELETED)
    })
  })

  describe('findBasicInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.findBasicInvoice('')).rejects.toThrow(EInvoiceError)
    })

    it('Faturaya göre fatura getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()
      const mockInvoice = mockInvoices[0]

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      const invoice = await EInvoice.findBasicInvoice(
        mappingBasicInvoiceKeys(mockInvoice) as unknown as BasicInvoice
      )

      expect(invoice).toStrictEqual(mappingBasicInvoiceKeys(mockInvoice))
    })

    it("Fatura UUID'ine göre faturayı getirmeli.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockInvoices = generateMockInvoices()
      const mockInvoice = mockInvoices[0]

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mockInvoices
          }
        })
      })

      const invoice = await EInvoice.findBasicInvoice(
        mockInvoice.ettn as string
      )

      expect(invoice).toStrictEqual(mappingBasicInvoiceKeys(mockInvoice))
    })
  })

  describe('filterBasicInvoicesByApprovalStatus()', () => {
    it('"Onaylanmış" faturaları getirmeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[]

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        InvoiceApprovalStatus.APPROVED
      )

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === InvoiceApprovalStatus.APPROVED
      )

      expect(actualInvoices).toHaveLength(1)
      expect(expectedInvoices).toHaveLength(1)
      expect(actualInvoices).toEqual(expectedInvoices)
    })

    it('"Onaylanmamış" faturaları getirmeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[]

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        InvoiceApprovalStatus.UNAPPROVED
      )

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === InvoiceApprovalStatus.UNAPPROVED
      )

      expect(actualInvoices).toHaveLength(1)
      expect(expectedInvoices).toHaveLength(1)
      expect(actualInvoices).toEqual(expectedInvoices)
    })

    it('"Silinmiş" faturaları getirmeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[]

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        InvoiceApprovalStatus.DELETED
      )

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === InvoiceApprovalStatus.DELETED
      )

      expect(actualInvoices).toHaveLength(1)
      expect(expectedInvoices).toHaveLength(1)
      expect(actualInvoices).toEqual(expectedInvoices)
    })

    it('Herhangi bir fatura dönmemeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[]

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        ''
      )

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === ''
      )

      expect(actualInvoices).toHaveLength(0)
      expect(expectedInvoices).toHaveLength(0)
      expect(actualInvoices).toEqual(expectedInvoices)
    })
  })

  describe('getInvoiceHTML()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getInvoiceHTML('')).rejects.toThrow(EInvoiceError)
    })

    it('Fatura ile HTML içeriğini getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const expectedHTML = '<b>Fatura HTML.</b>'

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: expectedHTML
          }
        })
      })

      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      })
      const invoiceHTML = await EInvoice.getInvoiceHTML(
        mockInvoice as BasicInvoice
      )

      expect(invoiceHTML).toBe(expectedHTML)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
        pageName: 'RG_TASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid,
          onayDurumu: 'Onaylandı'
        })
      })
    })

    it("Fatura UUID'i ile HTML içeriğini getirmeli.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const expectedHTML = '<b>Fatura HTML.</b>'

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: expectedHTML
          }
        })
      })

      const uuid = uuidV1()
      const invoiceHTML = await EInvoice.getInvoiceHTML(uuid, false)

      expect(invoiceHTML).toBe(expectedHTML)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
        pageName: 'RG_TASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid,
          onayDurumu: 'Onaylanmadı'
        })
      })
    })

    it('Fatura HTML içeriğine "window.print()" eklemeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const expectedHTML = `
      <html lang="tr">
      <body>
        <b>Fatura HTML.</b>
      </body>
      </html>
      `

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: expectedHTML
          }
        })
      })

      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      })
      const invoiceHTML = await EInvoice.getInvoiceHTML(
        mockInvoice as BasicInvoice,
        false,
        true
      )

      expect(invoiceHTML).toBe(
        expectedHTML.replace(
          '</body>',
          '<script>window.print();</script></body>'
        )
      )

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
        pageName: 'RG_TASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid,
          onayDurumu: 'Onaylanmadı'
        })
      })
    })
  })

  describe('getInvoicePDF()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getInvoicePDF('')).rejects.toThrow(EInvoiceError)
    })

    it('Fatura ile PDF içeriğini getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const expectedHTML = '<b>Fatura HTML.</b>'
      const expectedPDFBuffer = Buffer.from(expectedHTML)

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: expectedHTML
          }
        })
      })

      mockedPuppeteer.launch.mockResolvedValue({
        close: jest.fn(),
        newPage: jest.fn().mockResolvedValue({
          pdf: jest.fn().mockResolvedValue(expectedPDFBuffer),
          setContent: jest.fn()
        } as unknown as Page)
      } as unknown as Browser)

      const pdfBuffer = await EInvoice.getInvoicePDF(
        generateMockBasicInvoice({
          uuid: uuidV1()
        }) as BasicInvoice
      )

      expect(mockedPuppeteer.launch).toBeCalledTimes(1)

      const browser =
        (await mockedPuppeteer.launch()) as jest.MockedObjectDeep<Browser>

      expect(browser.newPage).toBeCalledTimes(1)

      const page = (await browser.newPage()) as jest.MockedObjectDeep<Page>

      expect(pdfBuffer).toEqual(expectedPDFBuffer)

      expect(pdfBuffer.toString()).toBe(expectedHTML)

      expect(page.pdf).toHaveBeenCalledWith({
        format: 'a4',
        path: undefined
      })

      expect(page.setContent).toHaveBeenCalledWith(expectedHTML, {
        waitUntil: 'domcontentloaded'
      })

      expect(browser.close).toBeCalledTimes(1)
    })

    it("Fatura UUID'i ile PDF içeriğini getirmeli.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const expectedHTML = '<b>Fatura HTML.</b>'
      const expectedPDFBuffer = Buffer.from(expectedHTML)

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: expectedHTML
          }
        })
      })

      mockedPuppeteer.launch.mockResolvedValue({
        close: jest.fn(),
        newPage: jest.fn().mockResolvedValue({
          pdf: jest.fn().mockResolvedValue(expectedPDFBuffer),
          setContent: jest.fn()
        } as unknown as Page)
      } as unknown as Browser)

      const pdfBuffer = await EInvoice.getInvoicePDF(uuidV1())

      expect(mockedPuppeteer.launch).toBeCalledTimes(1)

      const browser =
        (await mockedPuppeteer.launch()) as jest.MockedObjectDeep<Browser>

      expect(browser.newPage).toBeCalledTimes(1)

      const page = (await browser.newPage()) as jest.MockedObjectDeep<Page>

      expect(pdfBuffer).toEqual(expectedPDFBuffer)

      expect(pdfBuffer.toString()).toBe(expectedHTML)

      expect(page.pdf).toHaveBeenCalledWith({
        format: 'a4',
        path: undefined
      })

      expect(page.setContent).toHaveBeenCalledWith(expectedHTML, {
        waitUntil: 'domcontentloaded'
      })

      expect(browser.close).toBeCalledTimes(1)
    })
  })

  describe('getInvoiceDownloadUrl()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getInvoiceDownloadUrl('')).toThrow(EInvoiceError)
    })

    it('Fatura ile faturaya ait indirme bağlantısını getirmeli.', () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice
      const downloadUrl = EInvoice.getInvoiceDownloadUrl(mockInvoice)

      const query: Record<string, string> = {
        token: accessToken,
        ettn: uuid,
        belgeTip: 'FATURA',
        onayDurumu: 'Onaylandı',
        cmd: 'EARSIV_PORTAL_BELGE_INDIR'
      }

      expect(downloadUrl).toBe(
        `${EInvoiceApi.BASE_URL}/earsiv-services/download?${qs.stringify(
          query
        )}`
      )
    })

    it("Fatura UUID'i ile faturaya ait indirme bağlantısını getirmeli.", () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const downloadUrl = EInvoice.getInvoiceDownloadUrl(uuid, false)

      const query: Record<string, string> = {
        token: accessToken,
        ettn: uuid,
        belgeTip: 'FATURA',
        onayDurumu: 'Onaylanmadı',
        cmd: 'EARSIV_PORTAL_BELGE_INDIR'
      }

      expect(downloadUrl).toBe(
        `${EInvoiceApi.BASE_URL}/earsiv-services/download?${qs.stringify(
          query
        )}`
      )
    })
  })

  describe('getUserInformation()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getUserInformation()).rejects.toThrow(EInvoiceError)
    })

    it('e-Arşiv üzerinde kayıtlı olan kullanıcı bilgilerini getirmeli.', async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockUserInformation: UserInformation = {
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
        country: EInvoiceCountry.TURKIYE,
        phoneNumber: 'phoneNumber',
        faxNumber: 'faxNumber',
        businessCenter: 'businessCenter'
      }

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mappingUserInformationKeys(mockUserInformation, true)
          }
        })
      })

      const userInformation = await EInvoice.getUserInformation()

      expect(userInformation).toEqual(mockUserInformation)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR',
        pageName: 'RG_KULLANICI',
        token: accessToken,
        jp: '{}'
      })
    })
  })

  describe('updateUserInformation()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.updateUserInformation({})).rejects.toThrow(
        EInvoiceError
      )
    })

    it("e-Arşiv'de kayıtlı olan kullanıcı bilgilerini güncellemeli.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const mockUserInformation: UserInformation = {
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
        country: EInvoiceCountry.TURKIYE,
        phoneNumber: 'phoneNumber',
        faxNumber: 'faxNumber',
        businessCenter: 'businessCenter'
      }

      const mockUpdateUserInformation: Partial<UserInformation> = {
        title: 'updatedTitle',
        firstName: 'updatedFirstName',
        lastName: 'updatedLastName'
      }

      Object.defineProperty(EInvoice, 'getUserInformation', {
        value: () => Promise.resolve(mockUserInformation)
      })

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: 'Bilgileriniz başarıyla güncellendi.'
          }
        })
      })

      const newUserInformation = await EInvoice.updateUserInformation(
        mockUpdateUserInformation
      )

      expect(newUserInformation).toEqual({
        ...mockUserInformation,
        ...mockUpdateUserInformation
      })

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET',
        pageName: 'RG_KULLANICI',
        token: accessToken,
        jp: JSON.stringify(
          mappingUserInformationKeys(
            {
              ...mockUserInformation,
              ...mockUpdateUserInformation
            },
            true
          )
        )
      })
    })
  })

  describe('getCompanyInformation()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getCompanyInformation('')).rejects.toThrow(
        EInvoiceError
      )
    })

    it('T.C Kimlik Numarasanına göre şirket bilgilerini getirmeli.', async () => {
      const accessToken = 'testToken'
      const trIdentityNumber = '1'.repeat(11)

      EInvoice.setToken(accessToken)

      const mockCompanyInformation: CompanyInformation = {
        title: 'title',
        firstName: 'firstName',
        lastName: 'lastName',
        taxOffice: 'taxOffice'
      }

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: mappingCompanyInformationKeys(mockCompanyInformation, true)
          }
        })
      })

      const companyInformation = await EInvoice.getCompanyInformation(
        trIdentityNumber
      )

      expect(mockCompanyInformation).toEqual(companyInformation)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'SICIL_VEYA_MERNISTEN_BILGILERI_GETIR',
        pageName: 'RG_BASITFATURA',
        token: accessToken,
        jp: JSON.stringify({
          vknTcknn: trIdentityNumber
        })
      })
    })
  })

  describe('getSavedPhoneNumber()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getSavedPhoneNumber()).rejects.toThrow(
        EInvoiceError
      )
    })

    it('e-Arşiv üzerinde kayıtlı olan telefon numarasını getirmeli.', async () => {
      const accessToken = 'testToken'
      const expectedPhoneNumber = '5'.repeat(10)

      EInvoice.setToken(accessToken)

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: {
              telefon: expectedPhoneNumber
            }
          }
        })
      })

      const phoneNumber = await EInvoice.getSavedPhoneNumber()

      expect(phoneNumber).toBe(expectedPhoneNumber)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_TELEFONNO_SORGULA',
        pageName: 'RG_BASITTASLAKLAR',
        token: accessToken,
        jp: '{}'
      })
    })
  })

  describe('getInvoiceUuid()', () => {
    it("Faturanın UUID'ini getirmeli.", () => {
      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice

      const uuid1 = EInvoice.getInvoiceUuid(mockInvoice)
      const uuid2 = EInvoice.getInvoiceUuid(mockInvoice.uuid)

      expect(uuid1).toBe(uuid)
      expect(uuid2).toBe(uuid)
    })
  })

  describe('createDraftInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() =>
        EInvoice.createDraftInvoice({} as CreateDraftInvoicePayload)
      ).rejects.toThrow(EInvoiceError)
    })

    it("e-Arşiv'de taslak olarak bir fatura oluşturmalı.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const invoicePayload: CreateDraftInvoicePayload = {
        uuid,
        base: 10,
        paymentPrice: 10,
        includedTaxesTotalPrice: 10,
        products: [
          {
            name: 'Test Ürün',
            quantity: 5,
            unitPrice: 2,
            price: 10,
            totalAmount: 10
          }
        ],
        productsTotalPrice: 10
      }

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: 'Faturanız başarıyla oluşturulmuştur'
          }
        })
      })

      const result = await EInvoice.createDraftInvoice(invoicePayload)

      expect(result).toBe(uuid)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
        pageName: 'RG_BASITFATURA',
        token: accessToken,
        jp: JSON.stringify(mappingDraftInvoiceKeys(invoicePayload))
      })
    })
  })

  describe('updateDraftInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() =>
        EInvoice.updateDraftInvoice('', {} as UpdateDraftInvoicePayload)
      ).rejects.toThrow(EInvoiceError)
    })

    it("e-Arşiv'de taslak olarak bulunan bir faturayı güncellemeli.", async () => {
      const accessToken = 'testToken'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const date = new Date()
      const mockInvoice = generateMockInvoice({
        uuid,
        date
      })
      const updatePayload: UpdateDraftInvoicePayload = {
        buyerFirstName: 'Test Alıcı Adı',
        buyerLastName: 'Test Alıcı Soyadı'
      }

      Object.defineProperty(EInvoice, 'getInvoice', {
        value: () => Promise.resolve(mockInvoice)
      })

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: 'Faturanız başarıyla oluşturulmuştur'
          }
        })
      })

      const newInvoice = await EInvoice.updateDraftInvoice(uuid, updatePayload)

      expect(newInvoice).toStrictEqual({
        ...mockInvoice,
        ...updatePayload
      })

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
        pageName: 'RG_BASITFATURA',
        token: accessToken,
        jp: JSON.stringify(
          mappingDraftInvoiceKeys({
            ...mockInvoice,
            ...updatePayload
          } as CreateDraftInvoicePayload)
        )
      })
    })
  })

  describe('deleteDraftInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() =>
        EInvoice.deleteDraftInvoice({} as BasicInvoice, '')
      ).rejects.toThrow(EInvoiceError)
    })

    it("e-Arşiv'de taslak olarak bulunan bir faturayı silmeli.", async () => {
      const accessToken = 'testToken'
      const deleteReason = 'İade işlemi'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: '1 fatura başarıyla silindi.'
          }
        })
      })

      const result = await EInvoice.deleteDraftInvoice(
        mockInvoice,
        deleteReason
      )

      expect(result).toBeTruthy()

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_FATURA_SIL',
        pageName: 'RG_TASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          silinecekler: [mappingBasicInvoiceKeys(mockInvoice, true)],
          aciklama: deleteReason
        })
      })
    })
  })

  describe('createCancelRequestForInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() =>
        EInvoice.createCancelRequestForInvoice({} as BasicInvoice, '')
      ).rejects.toThrow(EInvoiceError)
    })

    it('e-Arşiv fatura iptal talebi oluşturmalı.', async () => {
      const accessToken = 'testToken'
      const cancelReason = 'Deneme'

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: 'İptal talebiniz başarıyla oluşturulmuş'
          }
        })
      })

      const result = await EInvoice.createCancelRequestForInvoice(
        mockInvoice,
        cancelReason
      )

      expect(result).toBeTruthy()

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_IPTAL_TALEBI_OLUSTUR',
        pageName: 'RG_BASITTASLAKLAR',
        token: accessToken,
        jp: JSON.stringify({
          ettn: uuid,
          onayDurumu: mockInvoice.approvalStatus,
          belgeTuru: mockInvoice.documentType,
          talepAciklama: cancelReason
        })
      })
    })
  })

  describe('sendSMSCode()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.sendSMSCode()).rejects.toThrow(EInvoiceError)
    })

    it('SMS ile doğrulama kodu göndermeli.', async () => {
      const mockOid = uuidV1()
      const accessToken = 'testToken'
      const mockPhoneNumber = '5'.repeat(10)

      EInvoice.setToken(accessToken)

      Object.defineProperty(EInvoice, 'getSavedPhoneNumber', {
        value: () => Promise.resolve(mockPhoneNumber)
      })

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: {
              oid: mockOid
            }
          }
        })
      })

      const result = await EInvoice.sendSMSCode()

      expect(result).toBe(mockOid)

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: 'EARSIV_PORTAL_SMSSIFRE_GONDER',
        pageName: 'RG_SMSONAY',
        token: accessToken,
        jp: JSON.stringify({
          CEPTEL: mockPhoneNumber,
          KCEPTEL: false,
          TIP: ''
        })
      })
    })
  })

  describe('verifySMSCode()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() =>
        EInvoice.verifySMSCode('', '', {} as BasicInvoice)
      ).rejects.toThrow(EInvoiceError)
    })

    it('SMS ile gönderilen doğrulama kodunu onaylamalı ve fatura(ları) imzalamalı.', async () => {
      const accessToken = 'testToken'
      const mockSMSOid = uuidV1()
      const mockSMSCode = uuidV1()

      EInvoice.setToken(accessToken)

      const uuid = uuidV1()
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            data: {
              sonuc: '1'
            }
          }
        })
      })

      const result = await EInvoice.verifySMSCode(
        mockSMSCode,
        mockSMSOid,
        mockInvoice
      )

      expect(result).toBeTruthy()

      expect(mockedAxios.post.mock.calls?.[0]?.[0]).toBe(
        EInvoiceApi.DISPATCH_PATH
      )

      expect(
        removeCallIdFromParams(mockedAxios.post.mock.calls?.[0]?.[1])
      ).toEqual({
        cmd: '0lhozfib5410mp',
        pageName: 'RG_SMSONAY',
        token: accessToken,
        jp: JSON.stringify({
          SIFRE: mockSMSCode,
          OID: mockSMSOid,
          OPR: 1,
          DATA: [mappingBasicInvoiceKeys(mockInvoice, true)]
        })
      })
    })
  })

  describe('setAnonymousCredentials()', () => {
    it('Test ortamı için anonim kullanıcı adı ve şifre atamalı.', async () => {
      const mockUsername = uuidV1()

      mockedAxios.post.mockImplementation(() => {
        return Promise.resolve({
          data: {
            userid: mockUsername
          }
        })
      })

      await EInvoice.setAnonymousCredentials()

      expect(EInvoice.getCredentials()).toEqual({
        username: mockUsername,
        password: '1'
      })
    })
  })
})
