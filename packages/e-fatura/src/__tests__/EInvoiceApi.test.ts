import { it, vi, expect, describe, beforeEach, afterEach } from 'vitest';
import * as qs from 'node:querystring';
import { zipSync, unzipSync } from 'fflate';
import EInvoiceApi from '../EInvoiceApi';
import axios, { type AxiosRequestConfig } from 'axios';
import {
  uuidV1,
  getDateFormat,
  mappingInvoiceKeys,
  mappingDraftInvoiceKeys,
  mappingBasicInvoiceKeys,
  mappingUserInformationKeys,
  mappingCompanyInformationKeys,
  mappingBasicInvoiceIssuedToMeKeys
} from '../utils';
import {
  generateMockInvoice,
  generateMockInvoices,
  generateMockBasicInvoice
} from '../utils/test';
import {
  EInvoiceApiError,
  EInvoiceMissingTokenError,
  EInvoiceMissingCredentialsError
} from '../errors';
import {
  EInvoiceCountry,
  HourlySearchInterval,
  EInvoiceApiErrorCode,
  InvoiceApprovalStatus
} from '../enums';
import type {
  Invoice,
  BasicInvoice,
  UserInformation,
  CompanyInformation,
  CreateDraftInvoicePayload,
  UpdateDraftInvoicePayload
} from '../types';

const mockUuidValue = '0e6f07f0-fe5b-11ed-b085-07a0e2821700';

vi.mock('uuid', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const original = require('uuid');

  return {
    ...original,
    __esModule: true,
    v1: () => mockUuidValue
  };
});

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

function getRequestConfig(
  instance: EInvoiceApi,
  additional?: AxiosRequestConfig
): AxiosRequestConfig {
  const baseURL = instance.isTestMode
    ? EInvoiceApi.TEST_BASE_URL
    : EInvoiceApi.BASE_URL;

  return {
    timeout: 10 * 1000,
    ...additional,
    baseURL,
    headers: {
      ...additional?.headers,
      ...EInvoiceApi.DEFAULT_HEADERS,
      Referrer: `${baseURL}${EInvoiceApi.REFERRER_PATH}`
    }
  };
}

describe('EInvoiceApi', () => {
  let EInvoice: EInvoiceApi;

  beforeEach(() => {
    EInvoice = EInvoiceApi.create();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('Hata ayıklama', () => {
    it('Geçerli bir obje olmayan tepkiler hata oluşturmalı.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      mockedAxios.post.mockResolvedValue({
        data: null,
        status: 500
      });

      try {
        await EInvoice.getBasicInvoices();
      } catch (e) {
        const error = e as EInvoiceApiError;

        expect(error.response).toEqual({
          data: null,
          errorCode: EInvoiceApiErrorCode.INVALID_RESPONSE
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.DISPATCH_PATH,
          qs.stringify({
            cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
            callid: mockUuidValue,
            pageName: 'RG_BASITTASLAKLAR',
            token: accessToken,
            jp: JSON.stringify({
              baslangic: getDateFormat(),
              bitis: getDateFormat(),
              hangiTip: '5000/30000',
              table: []
            })
          }),
          getRequestConfig(EInvoice)
        );
      }
    });

    it('Tepki içerisinde "error" anahtarı varsa hata oluşturmalı.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      mockedAxios.post.mockResolvedValue({
        data: {
          error: '1',
          messages: []
        },
        status: 200
      });

      try {
        await EInvoice.getBasicInvoices();
      } catch (e) {
        const error = e as EInvoiceApiError;

        expect(error).toBeInstanceOf(EInvoiceApiError);

        expect(error.response).toEqual({
          data: {
            error: '1',
            messages: []
          },
          errorCode: EInvoiceApiErrorCode.UNKNOWN_ERROR
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.DISPATCH_PATH,
          qs.stringify({
            cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
            callid: mockUuidValue,
            pageName: 'RG_BASITTASLAKLAR',
            token: accessToken,
            jp: JSON.stringify({
              baslangic: getDateFormat(),
              bitis: getDateFormat(),
              hangiTip: '5000/30000',
              table: []
            })
          }),
          getRequestConfig(EInvoice)
        );
      }
    });
  });

  describe('setToken() & getToken()', () => {
    it('getToken metodu mevcut erişim jetonunu döndürmeli.', () => {
      expect(EInvoice.setToken('testToken')).toBeInstanceOf(EInvoiceApi);
      expect(EInvoice.getToken()).toBe('testToken');
    });
  });

  describe('setTestMode() & isTestMode', () => {
    it('Test modu aktif/deaktif edilmeli.', () => {
      expect(EInvoice.isTestMode).toBe(false);
      expect(EInvoice.setTestMode(true)).toBeInstanceOf(EInvoiceApi);
      expect(EInvoice.isTestMode).toBe(true);
    });
  });

  describe('setCredentials() & getCredentials()', () => {
    it('Kullanıcı adı atamalı.', () => {
      expect(
        EInvoice.setCredentials({
          username: 'testUsername'
        })
      ).toBeInstanceOf(EInvoiceApi);

      expect(EInvoice.getCredentials()).toStrictEqual({
        username: 'testUsername',
        password: null
      });
    });

    it('Şifre atamalı.', () => {
      expect(
        EInvoice.setCredentials({
          password: 'testPassword'
        })
      ).toBeInstanceOf(EInvoiceApi);

      expect(EInvoice.getCredentials()).toEqual({
        username: null,
        password: 'testPassword'
      });
    });

    it('Kullanıcı adı ve şifre atamalı.', () => {
      expect(
        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        })
      ).toBeInstanceOf(EInvoiceApi);

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      });
    });

    it('Kullanıcı adı ve şifre null ile değiştirilebilir.', () => {
      EInvoice.setCredentials({
        username: 'testUsername',
        password: 'testPassword'
      });

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      });

      EInvoice.setCredentials({
        username: null,
        password: null
      });

      expect(EInvoice.getCredentials()).toEqual({
        username: null,
        password: null
      });
    });

    it('Kullanıcı adı ve şifre undefined ile değiştirilemez.', () => {
      EInvoice.setCredentials({
        username: 'testUsername',
        password: 'testPassword'
      });

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      });

      EInvoice.setCredentials({
        username: undefined,
        password: undefined
      });

      expect(EInvoice.getCredentials()).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      });
    });
  });

  describe('connect()', () => {
    it('Kullanıcı adı ve şifre ile bağlantı kurulmalı.', async () => {
      const setTestModeFn = vi.spyOn(EInvoice, 'setTestMode');
      const setCredentialsFn = vi.spyOn(EInvoice, 'setCredentials');

      mockedAxios.post.mockResolvedValue({
        data: {
          token: 'access-token'
        }
      });

      expect(EInvoice.getToken()).toBeNull();

      await EInvoice.connect({
        username: '123456',
        password: 'password'
      });

      expect(EInvoice.isTestMode).toBe(false);
      expect(EInvoice.getToken()).toBe('access-token');
      expect(setTestModeFn).toHaveBeenCalledWith(false);
      expect(setCredentialsFn).toHaveBeenCalledWith({
        username: '123456',
        password: 'password'
      });
      expect(EInvoice.getCredentials()).toEqual({
        username: '123456',
        password: 'password'
      });
    });

    it('Anonim kullanıcı adı ve şifre ile bağlantı kurmalı.', async () => {
      const setCredentialsFn = vi.spyOn(EInvoice, 'setCredentials');
      const getAccessTokenFn = vi
        .spyOn(EInvoice, 'getAccessToken')
        .mockImplementation(() => Promise.resolve('access-token'));

      mockedAxios.post.mockResolvedValue({
        data: {
          userid: '123456'
        }
      });

      expect(EInvoice.isTestMode).toBe(false);

      await EInvoice.connect({
        anonymous: true
      });

      expect(EInvoice.isTestMode).toBe(true);
      expect(setCredentialsFn).toHaveBeenCalledWith({
        username: '123456',
        password: '1'
      });
      expect(EInvoice.getCredentials()).toEqual({
        username: '123456',
        password: '1'
      });
      expect(getAccessTokenFn).toHaveBeenCalled();
    });
  });

  describe('getAccessToken()', () => {
    it('Kullanıcı adı ve şifre belirtilmeiğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
        EInvoiceMissingCredentialsError
      );
    });

    describe('setTestMode(true)', () => {
      it("e-Arşiv'e bağlanmak için erişim jetonu almalı.", async () => {
        EInvoice.setTestMode(true);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const testToken = 'testToken';

        mockedAxios.post.mockResolvedValue({
          data: {
            token: testToken
          }
        });

        const token = await EInvoice.getAccessToken();
        const credentials = EInvoice.getCredentials();

        expect(token).toBe(testToken);
        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'login'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "null" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(true);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: null
          }
        });

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'login'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "boş bir dizi" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(true);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: ''
          }
        });

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'login'
          }),
          getRequestConfig(EInvoice)
        );
      });
    });

    describe('setTestMode(false)', () => {
      it("e-Arşiv'e bağlanmak için erişim jetonu almalı.", async () => {
        EInvoice.setTestMode(false);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const testToken = 'testToken';

        mockedAxios.post.mockResolvedValue({
          data: {
            token: testToken
          }
        });

        const token = await EInvoice.getAccessToken();
        const credentials = EInvoice.getCredentials();

        expect(token).toBe(testToken);
        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'anologin'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "null" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(false);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: null
          }
        });

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'anologin'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "boş bir dizi" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(false);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: ''
          }
        });

        await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'anologin'
          }),
          getRequestConfig(EInvoice)
        );
      });
    });
  });

  describe('initAccessToken()', () => {
    it('Kullanıcı adı ve şifre belirtilmeiğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getAccessToken()).rejects.toThrow(
        EInvoiceMissingCredentialsError
      );
    });

    describe('setTestMode(true)', () => {
      it("e-Arşiv'e bağlanmak için erişim jetonu atamalı.", async () => {
        EInvoice.setTestMode(true);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const testToken = 'testToken';

        mockedAxios.post.mockResolvedValue({
          data: {
            token: testToken
          }
        });

        await EInvoice.initAccessToken();
        const credentials = EInvoice.getCredentials();

        expect(EInvoice.getToken()).toBe(testToken);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'login'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "null" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(true);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: null
          }
        });

        await expect(() => EInvoice.initAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'login'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "boş bir dizi" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(true);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: ''
          }
        });

        await expect(() => EInvoice.initAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'login'
          }),
          getRequestConfig(EInvoice)
        );
      });
    });

    describe('setTestMode(false)', () => {
      it("e-Arşiv'e bağlanmak için erişim jetonu atamalı.", async () => {
        EInvoice.setTestMode(false);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const testToken = 'testToken';

        mockedAxios.post.mockResolvedValue({
          data: {
            token: testToken
          }
        });

        await EInvoice.initAccessToken();
        const credentials = EInvoice.getCredentials();

        expect(EInvoice.getToken()).toBe(testToken);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'anologin'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "null" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(false);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: null
          }
        });

        await expect(() => EInvoice.initAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'anologin'
          }),
          getRequestConfig(EInvoice)
        );
      });

      it('Erişim jetonu "boş bir dizi" olduğunda hata fırlatmalı.', async () => {
        EInvoice.setTestMode(false);

        EInvoice.setCredentials({
          username: 'testUsername',
          password: 'testPassword'
        });

        const credentials = EInvoice.getCredentials();

        mockedAxios.post.mockResolvedValue({
          data: {
            token: ''
          }
        });

        await expect(() => EInvoice.initAccessToken()).rejects.toThrow(
          EInvoiceApiError
        );

        expect(EInvoice.getToken()).toBe(null);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.TOKEN_PATH,
          qs.stringify({
            rtype: 'json',
            userid: credentials.username,
            sifre: credentials.password,
            sifre2: credentials.password,
            parola: '1',
            assoscmd: 'anologin'
          }),
          getRequestConfig(EInvoice)
        );
      });
    });
  });

  describe('getInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getInvoice('')).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Faturaya göre fatura getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const date = new Date();
      const mockInvoice = generateMockInvoice({
        uuid,
        date,
        mappingWithTurkishKeys: true
      });

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoice
        }
      });

      const invoice = await EInvoice.getInvoice(
        generateMockBasicInvoice({
          uuid
        }) as BasicInvoice
      );

      expect(invoice).toStrictEqual(mappingInvoiceKeys(mockInvoice));

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_BASITFATURA',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it("Fatura UUID'ine göre faturayı getirmeli.", async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const date = new Date();
      const mockInvoice = generateMockInvoice({
        uuid,
        date,
        mappingWithTurkishKeys: true
      });

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoice
        }
      });

      const invoice = await EInvoice.getInvoice(uuid);

      expect(invoice).toStrictEqual(
        generateMockInvoice({
          uuid,
          date
        })
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_BASITFATURA',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it('Fatura verisinde "hata" alanı olduğunda hata fırlatmalı.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const date = new Date();
      const mockInvoice = generateMockInvoice({
        uuid,
        date,
        mappingWithTurkishKeys: true
      });

      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            ...mockInvoice,
            hata: 'hata'
          }
        }
      });

      await expect(() => EInvoice.getInvoice(uuid)).rejects.toThrow(
        EInvoiceApiError
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_BASITFATURA',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('logout()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.logout()).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('e-Arşiv oturumunu sonlandırmalı.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      expect(EInvoice.getToken()).toBe(accessToken);

      mockedAxios.post.mockResolvedValue({
        data: {
          data: {}
        }
      });

      await EInvoice.logout();

      expect(EInvoice.getToken()).toBeNull();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.TOKEN_PATH,
        qs.stringify({
          rtype: 'json',
          token: accessToken,
          assoscmd: 'logout'
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('getBasicInvoices()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getBasicInvoices()).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Bugüne ait faturaları getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      const invoices = await EInvoice.getBasicInvoices();

      expect(invoices).toHaveLength(mockInvoices.length);

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceKeys(value))
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_BASITTASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            baslangic: getDateFormat(),
            bitis: getDateFormat(),
            hangiTip: '5000/30000',
            table: []
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it('Belirli tarih aralığındaki faturaları getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 5);

      const endDate = new Date();

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      const invoices = await EInvoice.getBasicInvoices({
        startDate,
        endDate
      });

      expect(invoices).toHaveLength(mockInvoices.length);

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceKeys(value))
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_BASITTASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            baslangic: getDateFormat(startDate),
            bitis: getDateFormat(endDate),
            hangiTip: '5000/30000',
            table: []
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it('Faturaları "Onay Durumuna" göre filtrelemeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      async function expectInvoicesFromApprovalStatus(
        approvalStatus: InvoiceApprovalStatus
      ): Promise<void> {
        const invoices = await EInvoice.getBasicInvoices({
          approvalStatus
        });
        const filteredInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
          mockInvoices.map((value) => {
            return mappingBasicInvoiceKeys(value) as unknown as BasicInvoice;
          }),
          approvalStatus
        );

        expect(filteredInvoices.length).toBeGreaterThan(0);

        expect(invoices).toEqual(filteredInvoices);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.DISPATCH_PATH,
          qs.stringify({
            cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
            callid: mockUuidValue,
            pageName: 'RG_BASITTASLAKLAR',
            token: accessToken,
            jp: JSON.stringify({
              baslangic: getDateFormat(),
              bitis: getDateFormat(),
              hangiTip: '5000/30000',
              table: []
            })
          }),
          getRequestConfig(EInvoice)
        );
      }

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.APPROVED);

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.UNAPPROVED);

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.DELETED);
    });
  });

  describe('getBasicInvoicesIssuedToMe()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getBasicInvoicesIssuedToMe()).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Bugüne ait faturaları getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      const invoices = await EInvoice.getBasicInvoicesIssuedToMe();

      expect(invoices).toHaveLength(mockInvoices.length);

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceIssuedToMeKeys(value))
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_ALICI_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            baslangic: getDateFormat(),
            bitis: getDateFormat(),
            hourlySearchInterval: HourlySearchInterval.NONE
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it('Belirli tarih aralığındaki faturaları getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 5);

      const endDate = new Date();

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      const invoices = await EInvoice.getBasicInvoicesIssuedToMe({
        startDate,
        endDate
      });

      expect(invoices).toHaveLength(mockInvoices.length);

      expect(invoices).toEqual(
        mockInvoices.map((value) => mappingBasicInvoiceIssuedToMeKeys(value))
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_ALICI_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            baslangic: getDateFormat(startDate),
            bitis: getDateFormat(endDate),
            hourlySearchInterval: HourlySearchInterval.NONE
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it('Faturaları "Onay Durumuna" göre filtrelemeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      async function expectInvoicesFromApprovalStatus(
        approvalStatus: InvoiceApprovalStatus
      ): Promise<void> {
        const invoices = await EInvoice.getBasicInvoicesIssuedToMe({
          approvalStatus
        });
        const filteredInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
          mockInvoices.map((value) =>
            mappingBasicInvoiceIssuedToMeKeys(value)
          ) as unknown as BasicInvoice[],
          approvalStatus
        );

        expect(filteredInvoices.length).toBeGreaterThan(0);

        expect(invoices).toEqual(filteredInvoices);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          EInvoiceApi.DISPATCH_PATH,
          qs.stringify({
            cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
            callid: mockUuidValue,
            pageName: 'RG_ALICI_TASLAKLAR',
            token: accessToken,
            jp: JSON.stringify({
              baslangic: getDateFormat(),
              bitis: getDateFormat(),
              hourlySearchInterval: HourlySearchInterval.NONE
            })
          }),
          getRequestConfig(EInvoice)
        );
      }

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.APPROVED);

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.UNAPPROVED);

      await expectInvoicesFromApprovalStatus(InvoiceApprovalStatus.DELETED);
    });
  });

  describe('findBasicInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.findBasicInvoice('')).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Faturaya göre fatura getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();
      const mockInvoice = mockInvoices[0];

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      const invoice = await EInvoice.findBasicInvoice(
        mappingBasicInvoiceKeys(mockInvoice) as unknown as BasicInvoice
      );

      expect(invoice).toStrictEqual(mappingBasicInvoiceKeys(mockInvoice));
    });

    it("Fatura UUID'ine göre faturayı getirmeli.", async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const mockInvoices = generateMockInvoices();
      const mockInvoice = mockInvoices[0];

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mockInvoices
        }
      });

      const invoice = await EInvoice.findBasicInvoice(
        mockInvoice.ettn as string
      );

      expect(invoice).toStrictEqual(mappingBasicInvoiceKeys(mockInvoice));
    });
  });

  describe('filterBasicInvoicesByApprovalStatus()', () => {
    it('"Onaylanmış" faturaları getirmeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[];

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        InvoiceApprovalStatus.APPROVED
      );

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === InvoiceApprovalStatus.APPROVED
      );

      expect(actualInvoices).toHaveLength(1);
      expect(expectedInvoices).toHaveLength(1);
      expect(actualInvoices).toEqual(expectedInvoices);
    });

    it('"Onaylanmamış" faturaları getirmeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[];

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        InvoiceApprovalStatus.UNAPPROVED
      );

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === InvoiceApprovalStatus.UNAPPROVED
      );

      expect(actualInvoices).toHaveLength(1);
      expect(expectedInvoices).toHaveLength(1);
      expect(actualInvoices).toEqual(expectedInvoices);
    });

    it('"Silinmiş" faturaları getirmeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[];

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        InvoiceApprovalStatus.DELETED
      );

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === InvoiceApprovalStatus.DELETED
      );

      expect(actualInvoices).toHaveLength(1);
      expect(expectedInvoices).toHaveLength(1);
      expect(actualInvoices).toEqual(expectedInvoices);
    });

    it('Herhangi bir fatura dönmemeli.', () => {
      const mockInvoices = generateMockInvoices().map((value) =>
        mappingBasicInvoiceKeys(value)
      ) as unknown as BasicInvoice[];

      const actualInvoices = EInvoice.filterBasicInvoicesByApprovalStatus(
        mockInvoices,
        ''
      );

      const expectedInvoices = mockInvoices.filter(
        (value) => value.approvalStatus === ''
      );

      expect(actualInvoices).toHaveLength(0);
      expect(expectedInvoices).toHaveLength(0);
      expect(actualInvoices).toEqual(expectedInvoices);
    });
  });

  describe('getInvoiceHtml()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getInvoiceHtml('')).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Fatura ile HTML içeriğini getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const expectedHTML = '<b>Fatura HTML.</b>';

      mockedAxios.post.mockResolvedValue({
        data: {
          data: expectedHTML
        }
      });

      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      });
      const invoiceHTML = await EInvoice.getInvoiceHtml(
        mockInvoice as BasicInvoice
      );

      expect(invoiceHTML).toBe(expectedHTML);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
          callid: mockUuidValue,
          pageName: 'RG_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid,
            onayDurumu: 'Onaylandı'
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it("Fatura UUID'i ile HTML içeriğini getirmeli.", async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const expectedHTML = '<b>Fatura HTML.</b>';

      mockedAxios.post.mockResolvedValue({
        data: {
          data: expectedHTML
        }
      });

      const uuid = uuidV1();
      const invoiceHTML = await EInvoice.getInvoiceHtml(uuid, false);

      expect(invoiceHTML).toBe(expectedHTML);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
          callid: mockUuidValue,
          pageName: 'RG_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid,
            onayDurumu: 'Onaylanmadı'
          })
        }),
        getRequestConfig(EInvoice)
      );
    });

    it('Fatura HTML içeriğine "window.print()" eklemeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const expectedHTML = `
      <html lang="tr">
      <body>
        <b>Fatura HTML.</b>
      </body>
      </html>
      `;

      mockedAxios.post.mockResolvedValue({
        data: {
          data: expectedHTML
        }
      });

      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      });
      const invoiceHTML = await EInvoice.getInvoiceHtml(
        mockInvoice as BasicInvoice,
        false,
        true
      );

      expect(invoiceHTML).toBe(
        expectedHTML.replace(
          '</body>',
          '<script>window.print();</script></body>'
        )
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
          callid: mockUuidValue,
          pageName: 'RG_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid,
            onayDurumu: 'Onaylanmadı'
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  it.todo('getInvoicePdf()');

  describe('getInvoiceZip()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getInvoiceZip('')).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('"content-disposition" başlığı beklenen değere eşit değilse hata fırlatmalı.', async () => {
      const invoiceUUID = uuidV1();
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      mockedAxios.get.mockResolvedValue({
        data: zipSync({
          [`${invoiceUUID}_f.html`]: Buffer.from('invoice html'),
          [`${invoiceUUID}_f.xml`]: Buffer.from('invoice xml')
        })
      });

      await expect(() => EInvoice.getInvoiceZip(invoiceUUID)).rejects.toThrow(
        EInvoiceApiError
      );
    });

    it('Faturaya ait zip dosyası içeriğini getirmeli.', async () => {
      const invoiceUUID = uuidV1();
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const invoiceXmlBytes = new Uint8Array(Buffer.from('invoice xml'));
      const invoiceHtmlBytes = new Uint8Array(Buffer.from('invoice html'));

      mockedAxios.get.mockResolvedValue({
        data: zipSync({
          [`${invoiceUUID}_f.xml`]: invoiceXmlBytes,
          [`${invoiceUUID}_f.html`]: invoiceHtmlBytes
        }),
        headers: {
          'content-disposition': `attachment; filename="${invoiceUUID}_f.zip"`
        }
      });

      const zipBuffer = await EInvoice.getInvoiceZip(invoiceUUID);
      const zipEntries = unzipSync(zipBuffer);

      expect(zipEntries[`${invoiceUUID}_f.xml`]).toStrictEqual(invoiceXmlBytes);
      expect(zipEntries[`${invoiceUUID}_f.html`]).toStrictEqual(
        invoiceHtmlBytes
      );
    });
  });

  describe('getInvoiceXml()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getInvoiceXml('')).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Faturanın xml dosyası zip içerisinde yoksa hata fırlatmalı.', async () => {
      const invoiceUUID = uuidV1();
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const invoiceHtmlBytes = new Uint8Array(Buffer.from('invoice html'));

      mockedAxios.get.mockResolvedValue({
        data: zipSync({
          [`${invoiceUUID}_f.html`]: invoiceHtmlBytes
        }),
        headers: {
          'content-disposition': `attachment; filename="${invoiceUUID}_f.zip"`
        }
      });

      await expect(() => EInvoice.getInvoiceXml(invoiceUUID)).rejects.toThrow(
        EInvoiceApiError
      );
    });

    it('Faturanın xml içeriğini zip içersinden çıkarmalı.', async () => {
      const invoiceUUID = uuidV1();
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const invoiceXmlBytes = new Uint8Array(Buffer.from('invoice xml'));
      const invoiceHtmlBytes = new Uint8Array(Buffer.from('invoice html'));

      mockedAxios.get.mockResolvedValue({
        data: zipSync({
          [`${invoiceUUID}_f.xml`]: invoiceXmlBytes,
          [`${invoiceUUID}_f.html`]: invoiceHtmlBytes
        }),
        headers: {
          'content-disposition': `attachment; filename="${invoiceUUID}_f.zip"`
        }
      });

      const xmlBuffer = await EInvoice.getInvoiceXml(invoiceUUID);

      expect(xmlBuffer).toStrictEqual(Buffer.from(invoiceXmlBytes));
    });
  });

  describe('getInvoiceDownloadUrl()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', () => {
      expect(() => EInvoice.getInvoiceDownloadUrl('')).toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('Fatura ile faturaya ait indirme bağlantısını getirmeli.', () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice;
      const downloadUrl = EInvoice.getInvoiceDownloadUrl(mockInvoice);

      const query: Record<string, string> = {
        token: accessToken,
        ettn: uuid,
        belgeTip: 'FATURA',
        cmd: 'EARSIV_PORTAL_BELGE_INDIR',
        onayDurumu: 'Onaylandı'
      };

      expect(downloadUrl).toBe(
        `${EInvoiceApi.BASE_URL}/earsiv-services/download?${qs.stringify(
          query
        )}`
      );
    });

    it("Fatura UUID'i ile faturaya ait indirme bağlantısını getirmeli.", () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const downloadUrl = EInvoice.getInvoiceDownloadUrl(uuid, false);

      const query: Record<string, string> = {
        token: accessToken,
        ettn: uuid,
        belgeTip: 'FATURA',
        cmd: 'EARSIV_PORTAL_BELGE_INDIR',
        onayDurumu: 'Onaylanmadı'
      };

      expect(downloadUrl).toBe(
        `${EInvoiceApi.BASE_URL}/earsiv-services/download?${qs.stringify(
          query
        )}`
      );
    });
  });

  describe('getUserInformation()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getUserInformation()).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('e-Arşiv üzerinde kayıtlı olan kullanıcı bilgilerini getirmeli.', async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

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
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mappingUserInformationKeys(mockUserInformation, true)
        }
      });

      const userInformation = await EInvoice.getUserInformation();

      expect(userInformation).toEqual(mockUserInformation);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_KULLANICI',
          token: accessToken,
          jp: '{}'
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('updateUserInformation()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.updateUserInformation({})).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it("e-Arşiv'de kayıtlı olan kullanıcı bilgilerini güncellemeli.", async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

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
      };

      const mockUpdateUserInformation: Partial<UserInformation> = {
        title: 'updatedTitle',
        firstName: 'updatedFirstName',
        lastName: 'updatedLastName'
      };

      const getUserInformationFn = vi
        .spyOn(EInvoice, 'getUserInformation')
        .mockResolvedValue(mockUserInformation);

      mockedAxios.post.mockResolvedValue({
        data: {
          data: 'Bilgileriniz başarıyla güncellendi.'
        }
      });

      const newUserInformation = await EInvoice.updateUserInformation(
        mockUpdateUserInformation
      );

      expect(newUserInformation).toEqual({
        ...mockUserInformation,
        ...mockUpdateUserInformation
      });

      expect(getUserInformationFn).toHaveBeenCalled();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET',
          callid: mockUuidValue,
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
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('getCompanyInformation()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getCompanyInformation('')).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('T.C Kimlik Numarasanına göre şirket bilgilerini getirmeli.', async () => {
      const accessToken = 'testToken';
      const trIdentityNumber = '1'.repeat(11);

      EInvoice.setToken(accessToken);

      const mockCompanyInformation: CompanyInformation = {
        title: 'title',
        firstName: 'firstName',
        lastName: 'lastName',
        taxOffice: 'taxOffice'
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          data: mappingCompanyInformationKeys(mockCompanyInformation, true)
        }
      });

      const companyInformation =
        await EInvoice.getCompanyInformation(trIdentityNumber);

      expect(mockCompanyInformation).toEqual(companyInformation);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'SICIL_VEYA_MERNISTEN_BILGILERI_GETIR',
          callid: mockUuidValue,
          pageName: 'RG_BASITFATURA',
          token: accessToken,
          jp: JSON.stringify({
            vknTcknn: trIdentityNumber
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('getSavedPhoneNumber()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.getSavedPhoneNumber()).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('e-Arşiv üzerinde kayıtlı olan telefon numarasını getirmeli.', async () => {
      const accessToken = 'testToken';
      const expectedPhoneNumber = '5'.repeat(10);

      EInvoice.setToken(accessToken);

      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            telefon: expectedPhoneNumber
          }
        }
      });

      const phoneNumber = await EInvoice.getSavedPhoneNumber();

      expect(phoneNumber).toBe(expectedPhoneNumber);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_TELEFONNO_SORGULA',
          callid: mockUuidValue,
          pageName: 'RG_BASITTASLAKLAR',
          token: accessToken,
          jp: '{}'
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('getInvoiceUuid()', () => {
    it("Faturanın UUID'ini getirmeli.", () => {
      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice;

      expect(EInvoice.getInvoiceUuid(mockInvoice)).toBe(uuid);
      expect(EInvoice.getInvoiceUuid(mockInvoice.uuid)).toBe(uuid);
    });
  });

  describe('createDraftInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() =>
        EInvoice.createDraftInvoice({} as CreateDraftInvoicePayload)
      ).rejects.toThrow(EInvoiceMissingTokenError);
    });

    it("e-Arşiv'de taslak olarak bir fatura oluşturmalı.", async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
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
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          data: 'Faturanız başarıyla oluşturulmuştur'
        }
      });

      const result = await EInvoice.createDraftInvoice(invoicePayload);

      expect(result).toBe(uuid);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
          callid: mockUuidValue,
          pageName: 'RG_BASITFATURA',
          token: accessToken,
          jp: JSON.stringify(mappingDraftInvoiceKeys(invoicePayload))
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('updateDraftInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() =>
        EInvoice.updateDraftInvoice('', {} as UpdateDraftInvoicePayload)
      ).rejects.toThrow(EInvoiceMissingTokenError);
    });

    it("e-Arşiv'de taslak olarak bulunan bir faturayı güncellemeli.", async () => {
      const accessToken = 'testToken';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const date = new Date();
      const mockInvoice = generateMockInvoice({
        uuid,
        date
      });
      const updatePayload: UpdateDraftInvoicePayload = {
        buyerFirstName: 'Test Alıcı Adı',
        buyerLastName: 'Test Alıcı Soyadı'
      };

      const getInvoiceFn = vi
        .spyOn(EInvoice, 'getInvoice')
        .mockResolvedValue(mockInvoice as Invoice);

      mockedAxios.post.mockResolvedValue({
        data: {
          data: 'Faturanız başarıyla oluşturulmuştur'
        }
      });

      const newInvoice = await EInvoice.updateDraftInvoice(uuid, updatePayload);

      expect(newInvoice).toStrictEqual({
        ...mockInvoice,
        ...updatePayload
      });

      expect(getInvoiceFn).toHaveBeenCalled();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
          callid: mockUuidValue,
          pageName: 'RG_BASITFATURA',
          token: accessToken,
          jp: JSON.stringify(
            mappingDraftInvoiceKeys({
              ...mockInvoice,
              ...updatePayload
            } as CreateDraftInvoicePayload)
          )
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('deleteDraftInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() =>
        EInvoice.deleteDraftInvoice({} as BasicInvoice, '')
      ).rejects.toThrow(EInvoiceMissingTokenError);
    });

    it("e-Arşiv'de taslak olarak bulunan bir faturayı silmeli.", async () => {
      const accessToken = 'testToken';
      const deleteReason = 'İade işlemi';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice;

      mockedAxios.post.mockResolvedValue({
        data: {
          data: '1 fatura başarıyla silindi.'
        }
      });

      const result = await EInvoice.deleteDraftInvoice(
        mockInvoice,
        deleteReason
      );

      expect(result).toBe(true);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_FATURA_SIL',
          callid: mockUuidValue,
          pageName: 'RG_TASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            silinecekler: [mappingBasicInvoiceKeys(mockInvoice, true)],
            aciklama: deleteReason
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('createCancelRequestForInvoice()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() =>
        EInvoice.createCancelRequestForInvoice({} as BasicInvoice, '')
      ).rejects.toThrow(EInvoiceMissingTokenError);
    });

    it('e-Arşiv fatura iptal talebi oluşturmalı.', async () => {
      const accessToken = 'testToken';
      const cancelReason = 'Deneme';

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice;

      mockedAxios.post.mockResolvedValue({
        data: {
          data: 'İptal talebiniz başarıyla oluşturulmuş'
        }
      });

      const result = await EInvoice.createCancelRequestForInvoice(
        mockInvoice,
        cancelReason
      );

      expect(result).toBe(true);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_IPTAL_TALEBI_OLUSTUR',
          callid: mockUuidValue,
          pageName: 'RG_BASITTASLAKLAR',
          token: accessToken,
          jp: JSON.stringify({
            ettn: uuid,
            onayDurumu: mockInvoice.approvalStatus,
            belgeTuru: mockInvoice.documentType,
            talepAciklama: cancelReason
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('sendSMSCode()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() => EInvoice.sendSMSCode()).rejects.toThrow(
        EInvoiceMissingTokenError
      );
    });

    it('SMS ile doğrulama kodu göndermeli.', async () => {
      const mockOid = uuidV1();
      const accessToken = 'testToken';
      const mockPhoneNumber = '5'.repeat(10);

      EInvoice.setToken(accessToken);

      const getSavedPhoneNumberFn = vi
        .spyOn(EInvoice, 'getSavedPhoneNumber')
        .mockResolvedValue(mockPhoneNumber);

      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            oid: mockOid
          }
        }
      });

      const result = await EInvoice.sendSMSCode();

      expect(result).toStrictEqual({
        oid: mockOid,
        phoneNumber: mockPhoneNumber
      });

      expect(getSavedPhoneNumberFn).toHaveBeenCalled();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: 'EARSIV_PORTAL_SMSSIFRE_GONDER',
          callid: mockUuidValue,
          pageName: 'RG_SMSONAY',
          token: accessToken,
          jp: JSON.stringify({
            CEPTEL: mockPhoneNumber,
            KCEPTEL: false,
            TIP: ''
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('signInvoices()', () => {
    it('Erişim jetonu belirtilmediğinde hata fırlatmalı.', async () => {
      await expect(() =>
        EInvoice.signInvoices('', '', {} as BasicInvoice)
      ).rejects.toThrow(EInvoiceMissingTokenError);
    });

    it('SMS ile gönderilen doğrulama kodunu onaylamalı ve fatura(ları) imzalamalı.', async () => {
      const accessToken = 'testToken';
      const mockSMSOid = uuidV1();
      const mockSMSCode = uuidV1();

      EInvoice.setToken(accessToken);

      const uuid = uuidV1();
      const mockInvoice = generateMockBasicInvoice({
        uuid
      }) as unknown as BasicInvoice;

      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            sonuc: '1'
          }
        }
      });

      const result = await EInvoice.signInvoices(
        mockSMSCode,
        mockSMSOid,
        mockInvoice
      );

      expect(result).toBe(true);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        EInvoiceApi.DISPATCH_PATH,
        qs.stringify({
          cmd: '0lhozfib5410mp',
          callid: mockUuidValue,
          pageName: 'RG_SMSONAY',
          token: accessToken,
          jp: JSON.stringify({
            SIFRE: mockSMSCode,
            OID: mockSMSOid,
            OPR: 1,
            DATA: [mappingBasicInvoiceKeys(mockInvoice, true)]
          })
        }),
        getRequestConfig(EInvoice)
      );
    });
  });

  describe('setAnonymousCredentials()', () => {
    it('Test ortamı için anonim kullanıcı adı ve şifre atamalı.', async () => {
      const mockUsername = uuidV1();

      mockedAxios.post.mockResolvedValue({
        data: {
          userid: mockUsername
        }
      });

      await EInvoice.setAnonymousCredentials();

      expect(EInvoice.getCredentials()).toEqual({
        username: mockUsername,
        password: '1'
      });
    });
  });
});
