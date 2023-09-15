import https from 'https'
import crypto from 'crypto'
import qs from 'querystring'
import { v1 as uuidV1 } from 'uuid'
import deepMerge from 'lodash.merge'
import toArray from './utils/toArray'
import XsltRenderer from './XsltRenderer'
import axios, { AxiosRequestConfig } from 'axios'
import isPlainObject from './utils/isPlainObject'
import getDateFormat from './utils/getDateFormat'
import htmlToPdf, { PdfOptions } from './utils/htmlToPdf'
import EInvoiceTypeError from './errors/EInvoiceTypeError'
import EInvoiceApiError from './errors/EInvoiceApiError'
import mappingInvoiceKeys from './utils/mappingInvoiceKeys'
import EInvoiceApiErrorCode from './enums/EInvoiceApiErrorCode'
import mappingBasicInvoiceKeys from './utils/mappingBasicInvoiceKeys'
import mappingDraftInvoiceKeys from './utils/mappingDraftInvoiceKeys'
import type InvoiceApprovalStatus from './enums/InvoiceApprovalStatus'
import mappingUserInformationKeys from './utils/mappingUserInformationKeys'
import mappingCompanyInformationKeys from './utils/mappingCompanyInformationKeys'
import type {
  Invoice,
  Credentials,
  BasicInvoice,
  InvoiceOrUuid,
  UserInformation,
  CompanyInformation,
  FilterBasicInvoices,
  CreateDraftInvoicePayload,
  UpdateDraftInvoicePayload,
  InvoiceXsltRendererOptions,
  UpdateUserInformationPayload
} from './types'

const isTestEnv = process.env.NODE_ENV === 'test'

const allowLegacyRenegotiationForNodeJs = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
})

const getAxiosRequestConfig = (
  config?: AxiosRequestConfig
): AxiosRequestConfig => ({
  timeout: 10 * 1000,
  ...(!isTestEnv ? { httpsAgent: allowLegacyRenegotiationForNodeJs } : {}),
  ...config
})

class EInvoiceApi {
  private testMode = false

  private token: string | null = null

  private username: string | null = null

  private password: string | null = null

  static BASE_URL = 'https://earsivportal.efatura.gov.tr'

  static TEST_BASE_URL = 'https://earsivportaltest.efatura.gov.tr'

  static DISPATCH_PATH = '/earsiv-services/dispatch'

  static TOKEN_PATH = '/earsiv-services/assos-login'

  static REFERRER_PATH = '/intragiris.html'

  static DEFAULT_HEADERS: Record<string, string> = {
    Accept: '*/*',
    'Accept-Language': 'tr,en-US;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    Pragma: 'no-cache',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36'
  }

  /**
   * Yeni bir e-Arşiv API örneği oluşturur.
   */
  static create(): EInvoiceApi {
    return new EInvoiceApi()
  }

  /**
   * Var olan erişim jetonunu döndürür.
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Var olan erişim jetonunu değiştirir.
   * @param value Erişim jetonu değeri.
   */
  setToken(value: string | null): EInvoiceApi {
    this.token = value

    return this
  }

  /**
   * Test modunu verir.
   */
  getTestMode(): boolean {
    return this.testMode
  }

  /**
   * Test modunu aktif/deaktif eder.
   * @param value
   */
  setTestMode(value: boolean): EInvoiceApi {
    this.testMode = value

    return this
  }

  /**
   * Kullanıcı adı veya şifre bilgisini atamak için kullanılır.
   * @param value Kullanıcı adı veya şifre bilgisi.
   */
  setCredentials(value: Partial<Credentials>): EInvoiceApi {
    const { username, password } = value

    if (typeof username !== 'undefined') {
      this.username = username
    }

    if (typeof password !== 'undefined') {
      this.password = password
    }

    return this
  }

  /**
   * Mevcut olan kullanıcı adı ve şifre bilgisini getirir.
   */
  getCredentials(): Credentials {
    return {
      username: this.username,
      password: this.password
    }
  }

  /**
   * e-Arşiv oturumunu başlatır.
   */
  async connect(): Promise<void> {
    await this.getAccessToken()
  }

  /**
   * e-Arşiv oturumunu sonlandırır.
   */
  async logout(): Promise<void> {
    this.checkToken()

    const params: Record<string, string> = {
      rtype: 'json',
      token: this.token!,
      assoscmd: 'logout'
    }

    await this.sendRequest(EInvoiceApi.TOKEN_PATH, params)

    this.token = null
  }

  /**
   * e-Arşiv üxerinde kullanılacak erişim jetonunu alır.
   */
  async getAccessToken(): Promise<string> {
    this.checkCredentials()

    const params: Record<string, string> = {
      rtype: 'json',
      userid: this.username!,
      sifre: this.password!,
      sifre2: this.password!,
      parola: '1',
      assoscmd: this.testMode ? 'login' : 'anologin'
    }

    const data = await this.sendRequest<{ token?: unknown }>(
      EInvoiceApi.TOKEN_PATH,
      params
    )

    if (typeof data.token !== 'string' || data.token === '') {
      throw new EInvoiceApiError('Geçersiz erişim jetonu.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVALID_ACCESS_TOKEN
      })
    }

    this.token = data.token

    return data.token
  }

  /**
   * e-Arşiv üzerinde bulunan bir faturayı UUID'ine göre getirir.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   */
  async getInvoice(invoiceOrUuid: InvoiceOrUuid): Promise<Invoice> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_FATURA_GETIR',
      callid: uuidV1(),
      pageName: 'RG_BASITFATURA',
      token: this.token!,
      jp: JSON.stringify({
        ettn: this.getInvoiceUuid(invoiceOrUuid)
      })
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (!isPlainObject(data.data)) {
      throw new EInvoiceApiError('Fatura bulunamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVOICE_NOT_FOUND
      })
    }

    return mappingInvoiceKeys(data.data) as unknown as Invoice
  }

  /**
   * Düzenlenen faturaları getirir.
   * @param filter Faturaları filtrelemek için.
   */
  async getBasicInvoices(
    filter?: FilterBasicInvoices
  ): Promise<BasicInvoice[]> {
    this.checkToken()

    const { startDate, endDate, approvalStatus } = filter || {}
    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_TASLAKLARI_GETIR',
      callid: uuidV1(),
      pageName: 'RG_BASITTASLAKLAR',
      token: this.token!,
      jp: JSON.stringify({
        baslangic: getDateFormat(startDate),
        bitis: getDateFormat(endDate),
        hangiTip: '5000/30000',
        table: []
      })
    }

    const data = await this.sendRequest<{ data?: unknown[] }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (Array.isArray(data.data)) {
      return this.filterBasicInvoicesByApprovalStatus(
        (data.data as BasicInvoice[]).map((invoice) => {
          return mappingBasicInvoiceKeys(invoice) as unknown as BasicInvoice
        }),
        approvalStatus
      )
    }

    return []
  }

  /**
   * Adınıza düzenlenen faturaları getirir.
   * @param filter Faturaları filtrelemek için.
   */
  async getBasicInvoicesIssuedToMe(
    filter?: FilterBasicInvoices
  ): Promise<BasicInvoice[]> {
    this.checkToken()

    const { startDate, endDate, approvalStatus } = filter || {}
    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR',
      callid: uuidV1(),
      pageName: 'RG_ALICI_TASLAKLAR',
      token: this.token!,
      jp: JSON.stringify({
        baslangic: getDateFormat(startDate),
        bitis: getDateFormat(endDate),
        hangiTip: '5000/30000',
        table: []
      })
    }

    const data = await this.sendRequest<{ data?: unknown[] }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (Array.isArray(data.data)) {
      return this.filterBasicInvoicesByApprovalStatus(
        (data.data as BasicInvoice[]).map((invoice) => {
          return mappingBasicInvoiceKeys(invoice) as unknown as BasicInvoice
        }),
        approvalStatus
      )
    }

    return []
  }

  /**
   * Faturayı UUID değerine göre bulur.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param filter Faturaları filtrelemek için.
   */
  async findBasicInvoice(
    invoiceOrUuid: InvoiceOrUuid,
    filter?: FilterBasicInvoices
  ): Promise<BasicInvoice> {
    const invoices = await this.getBasicInvoices(filter)

    const invoice = invoices.find(
      (value) => value.uuid === this.getInvoiceUuid(invoiceOrUuid)
    )

    if (!invoice) {
      throw new EInvoiceApiError('Fatura bulunamadı.', {
        data: undefined,
        errorCode: EInvoiceApiErrorCode.BASIC_INVOICE_NOT_FOUND
      })
    }

    return invoice
  }

  /**
   * Faturanın html çıktısını getirir.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param signed Faturanın onay durumunu belirler. `true` Onaylandı `false` Onaylanmadı.
   * @param injectPrintScript HTML çıktısına `window.print()` komutunu ekler.
   */
  async getInvoiceHtml(
    invoiceOrUuid: InvoiceOrUuid,
    signed = true,
    injectPrintScript = false
  ): Promise<string> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_FATURA_GOSTER',
      callid: uuidV1(),
      pageName: 'RG_TASLAKLAR',
      token: this.token!,
      jp: JSON.stringify({
        ettn: this.getInvoiceUuid(invoiceOrUuid),
        onayDurumu: signed ? 'Onaylandı' : 'Onaylanmadı'
      })
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (typeof data.data !== 'string' || data.data === '') {
      throw new EInvoiceApiError('Faturaya ait HTML içeriği alınamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVALID_INVOICE_HTML
      })
    }

    if (injectPrintScript) {
      return data.data.replace(
        /<\/(body|html)>/,
        '<script>window.print();</script></$1>'
      )
    }

    return data.data
  }

  /**
   * Faturayı PDF'e dönüştürür.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param signed Faturanın onay durumunu belirler. `true` Onaylandı `false` Onaylanmadı.
   * @param options PDF seçenekleri.
   */
  async getInvoicePdf(
    invoiceOrUuid: InvoiceOrUuid,
    signed = true,
    options?: PdfOptions
  ): Promise<Buffer> {
    const html = await this.getInvoiceHtml(invoiceOrUuid, signed)

    return htmlToPdf(html, options)
  }

  /**
   * Faturayı zip formatına dönüştürür.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param signed Faturanın onay durumunu belirler. `true` Onaylandı `false` Onaylanmadı.
   */
  async getInvoiceZip(
    invoiceOrUuid: InvoiceOrUuid,
    signed?: boolean
  ): Promise<Buffer> {
    const invoiceUuid = this.getInvoiceUuid(invoiceOrUuid)
    const downloadUrl = this.getInvoiceDownloadUrl(invoiceUuid, signed)
    const { headers = {}, data: zipBuffer } = await axios.get<ArrayBuffer>(
      downloadUrl,
      getAxiosRequestConfig({
        responseType: 'arraybuffer'
      })
    )

    const contentDisposition = headers['content-disposition']
    const expectedContentDisposition = `attachment; filename="${invoiceUuid}_f.zip"`

    if (contentDisposition !== expectedContentDisposition) {
      throw new EInvoiceApiError('Geçersiz fatura zip dosyası yanıtı.', {
        data: undefined,
        errorCode: EInvoiceApiErrorCode.INVALID_INVOICE_ZIP_FILE_RESPONSE
      })
    }

    return Buffer.from(zipBuffer)
  }

  /**
   * Faturayı xml formatına dönüştürür.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param signed Faturanın onay durumunu belirler. `true` Onaylandı `false` Onaylanmadı.
   */
  async getInvoiceXml(
    invoiceOrUuid: InvoiceOrUuid,
    signed?: boolean
  ): Promise<Buffer> {
    const { unzipSync } = await import('fflate')
    const invoiceUuid = this.getInvoiceUuid(invoiceOrUuid)
    const xmlFilename = `${invoiceUuid}_f.xml`
    const zipBuffer = await this.getInvoiceZip(invoiceUuid, signed)

    const zipEntries = unzipSync(zipBuffer, {
      filter: (file) => file.name === xmlFilename
    })
    const xmlFileBytes = zipEntries[xmlFilename]

    if (!xmlFileBytes) {
      throw new EInvoiceApiError('Faturaya ait xml dosyası bulunamadı.', {
        data: undefined,
        errorCode: EInvoiceApiErrorCode.INVOICE_XML_FILE_NOT_FOUND
      })
    }

    return Buffer.from(xmlFileBytes)
  }

  /**
   * Faturanın indirilebilir bağlantısını verir.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param signed Faturanın onay durumunu belirler. `true` Onaylandı `false` Onaylanmadı.
   */
  getInvoiceDownloadUrl(invoiceOrUuid: InvoiceOrUuid, signed = true): string {
    this.checkToken()

    const query: Record<string, string> = {
      token: this.token!,
      ettn: this.getInvoiceUuid(invoiceOrUuid),
      belgeTip: 'FATURA',
      cmd: 'EARSIV_PORTAL_BELGE_INDIR',
      onayDurumu: signed ? 'Onaylandı' : 'Onaylanmadı'
    }

    return `${this.getBaseURL()}/earsiv-services/download?${qs.stringify(
      query
    )}`
  }

  /**
   * Belirli bir faturayı XSLT şablonu ile derlemenize olanak tanır.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param xsltFilePath XSLT şablonun yolu.
   * @param options XSLT şablonu derlemesi ve fatura ile ilgili seçenekler.
   */
  invoiceXsltRenderer(
    invoiceOrUuid: InvoiceOrUuid,
    xsltFilePath: string,
    options?: InvoiceXsltRendererOptions
  ): XsltRenderer {
    const { signed = true, xsltprocOptions } = options || {}

    return new XsltRenderer(
      xsltFilePath,
      this.getInvoiceXml.bind(this, invoiceOrUuid, signed),
      xsltprocOptions
    )
  }

  /**
   * e-Arşiv kullanıcı (şirket) bilgilerini getirir.
   */
  async getUserInformation(): Promise<UserInformation> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR',
      callid: uuidV1(),
      pageName: 'RG_KULLANICI',
      token: this.token!,
      jp: '{}'
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (!isPlainObject(data.data)) {
      throw new EInvoiceApiError('Kullanıcı (şirket) bilgisi bulunamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.USER_INFORMATION_NOT_FOUND
      })
    }

    return mappingUserInformationKeys(data.data) as unknown as UserInformation
  }

  /**
   * e-Arşiv kullanıcı (şirket) bilgilerini günceller.
   * @param payload Güncellemeye ait yük.
   */
  async updateUserInformation(
    payload: UpdateUserInformationPayload
  ): Promise<UserInformation> {
    this.checkToken()

    const userInformation = await this.getUserInformation()
    const newUserInformation: UserInformation = {
      ...userInformation,
      ...payload
    }
    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET',
      callid: uuidV1(),
      pageName: 'RG_KULLANICI',
      token: this.token!,
      jp: JSON.stringify(mappingUserInformationKeys(newUserInformation, true))
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      typeof data.data !== 'string' ||
      data.data !== 'Bilgileriniz başarıyla güncellendi.'
    ) {
      throw new EInvoiceApiError(
        'Kullanıcı (şirket) bilgileri güncellenemedi.',
        {
          data,
          errorCode: EInvoiceApiErrorCode.USER_INFORMATION_NOT_UPDATED
        }
      )
    }

    return newUserInformation
  }

  /**
   * Vergi Kimlik No veya T.C Kimlik No'ya göre tüzel veya gerçek kişilerin şirket bilgisini alır.
   * @param taxOrIdentityNumber Vergi Kimlik No veya T.C Kimlik No
   */
  async getCompanyInformation(
    taxOrIdentityNumber: string
  ): Promise<CompanyInformation> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'SICIL_VEYA_MERNISTEN_BILGILERI_GETIR',
      callid: uuidV1(),
      pageName: 'RG_BASITFATURA',
      token: this.token!,
      jp: JSON.stringify({
        vknTcknn: taxOrIdentityNumber
      })
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (!isPlainObject(data.data)) {
      throw new EInvoiceApiError('Şirket bilgisi bulunamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.COMPANY_INFORMATION_NOT_FOUND
      })
    }

    return mappingCompanyInformationKeys(
      data.data
    ) as unknown as CompanyInformation
  }

  /**
   * e-Arşiv üzerinde kayıtlı olan telefon numarasını getirir.
   */
  async getSavedPhoneNumber(): Promise<string> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_TELEFONNO_SORGULA',
      callid: uuidV1(),
      pageName: 'RG_BASITTASLAKLAR',
      token: this.token!,
      jp: '{}'
    }

    const data = await this.sendRequest<{ data?: { telefon?: unknown } }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (!isPlainObject(data.data) || !data.data.telefon) {
      throw new EInvoiceApiError('Kayıtlı telefon numarası bulunamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.SAVED_PHONE_NUMBER_NOT_FOUND
      })
    }

    return `${data.data.telefon}`
  }

  /**
   * e-Arşiv üzerinde taslak fatura oluşturur.
   * @param payload Faturaya ait yük.
   */
  async createDraftInvoice(
    payload: CreateDraftInvoicePayload
  ): Promise<string> {
    this.checkToken()

    const invoice = mappingDraftInvoiceKeys(payload)
    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
      callid: uuidV1(),
      pageName: 'RG_BASITFATURA',
      token: this.token!,
      jp: JSON.stringify(invoice)
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      typeof data.data !== 'string' ||
      !data.data.includes('Faturanız başarıyla oluşturulmuştur')
    ) {
      throw new EInvoiceApiError('Fatura oluşturulamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.BASIC_INVOICE_NOT_CREATED
      })
    }

    return invoice.faturaUuid as string
  }

  /**
   * e-Arşiv üzerinde taslak olarak bulunan bir faturayı günceller.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   * @param payload Güncelleme yükü.
   */
  async updateDraftInvoice(
    invoiceOrUuid: InvoiceOrUuid,
    payload: UpdateDraftInvoicePayload
  ): Promise<Invoice> {
    this.checkToken()

    const invoice = await this.getInvoice(invoiceOrUuid)

    const newInvoice = deepMerge(invoice, payload)
    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
      callid: uuidV1(),
      pageName: 'RG_BASITFATURA',
      token: this.token!,
      jp: JSON.stringify(mappingDraftInvoiceKeys(newInvoice))
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      typeof data.data !== 'string' ||
      !data.data.includes('Faturanız başarıyla oluşturulmuştur')
    ) {
      throw new EInvoiceApiError('Fatura güncellenemedı.', {
        data,
        errorCode: EInvoiceApiErrorCode.BASIC_INVOICE_NOT_CREATED
      })
    }

    return newInvoice
  }

  /**
   * e-Arşiv üzerinde taslak olarak bulunan bir faturayı siler.
   * @param invoice Fatura içeriği.
   * @param reason Silme nedeni.
   */
  async deleteDraftInvoice(
    invoice: BasicInvoice,
    reason: string
  ): Promise<boolean> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_FATURA_SIL',
      callid: uuidV1(),
      pageName: 'RG_TASLAKLAR',
      token: this.token!,
      jp: JSON.stringify({
        silinecekler: [mappingBasicInvoiceKeys(invoice, true)],
        aciklama: reason
      })
    }

    const data = await this.sendRequest<{ data?: unknown }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      typeof data.data !== 'string' ||
      !data.data.includes('fatura başarıyla silindi')
    ) {
      throw new EInvoiceApiError('Basit fatura silinemedi.', {
        data,
        errorCode: EInvoiceApiErrorCode.BASIC_INVOICE_NOT_DELETED
      })
    }

    return true
  }

  /**
   * e-Arşiv fatura iptal talebi oluşturur.
   * @param invoice Fatura içeriği.
   * @param reason İptal talebi nedeni.
   */
  async createCancelRequestForInvoice(
    invoice: BasicInvoice,
    reason: string
  ): Promise<boolean> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_IPTAL_TALEBI_OLUSTUR',
      callid: uuidV1(),
      pageName: 'RG_BASITTASLAKLAR',
      token: this.token!,
      jp: JSON.stringify({
        ettn: invoice.uuid,
        onayDurumu: invoice.approvalStatus,
        belgeTuru: invoice.documentType,
        talepAciklama: reason
      })
    }

    const data = await this.sendRequest<{ data?: string }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      typeof data.data !== 'string' ||
      !data.data.includes('İptal talebiniz başarıyla oluşturulmuş')
    ) {
      throw new EInvoiceApiError('Fatura iptal talebi oluşturulamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVOICE_CANCEL_REQUEST_NOT_CREATED
      })
    }

    return true
  }

  /**
   * @see EInvoiceApi.getSavedPhoneNumber()
   * Fatura imzalamak için SMS ile doğrulama kodu gönderir
   * ve doğrulamaya ait işlem kimliğini geri döner.
   */
  async sendSMSCode(): Promise<string> {
    this.checkToken()

    const phoneNumber = await this.getSavedPhoneNumber()

    const params: Record<string, string> = {
      cmd: 'EARSIV_PORTAL_SMSSIFRE_GONDER',
      callid: uuidV1(),
      pageName: 'RG_SMSONAY',
      token: this.token!,
      jp: JSON.stringify({
        CEPTEL: phoneNumber,
        KCEPTEL: false,
        TIP: ''
      })
    }

    const data = await this.sendRequest<{ data?: { oid?: unknown } }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      !isPlainObject(data.data) ||
      typeof data.data.oid !== 'string' ||
      data.data.oid === ''
    ) {
      throw new EInvoiceApiError('Geçersiz SMS işlem kimliği.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVALID_SMS_OPERATION_ID
      })
    }

    return data.data.oid
  }

  /**
   * Fatura imzalamak için SMS ile gönderilen doğrulama kodunu onaylar.
   * @see EInvoiceApi.sendSMSCode()
   * @param code e-Arşiv üzerinde kayıtlı olan telefon numarasına gelen doğrulama kodu.
   * @param oid `EInvoiceApi.sendSMSCode()` ile alınan işlem kimliği.
   * @param invoice İmzalanacak fatura(lar).
   */
  async verifySMSCode(
    code: string,
    oid: string,
    invoice: BasicInvoice | BasicInvoice[]
  ): Promise<boolean> {
    this.checkToken()

    const params: Record<string, string> = {
      cmd: '0lhozfib5410mp',
      callid: uuidV1(),
      pageName: 'RG_SMSONAY',
      token: this.token!,
      jp: JSON.stringify({
        SIFRE: code,
        OID: oid,
        OPR: 1,
        DATA: toArray(invoice).map((value) => {
          return mappingBasicInvoiceKeys(value, true)
        })
      })
    }

    const data = await this.sendRequest<{ data?: { sonuc?: unknown } }>(
      EInvoiceApi.DISPATCH_PATH,
      params
    )

    if (
      !isPlainObject(data.data) ||
      !data.data.sonuc ||
      `${data.data.sonuc}` === '0'
    ) {
      throw new EInvoiceApiError('SMS doğrulama kodu onaylanamadı.', {
        data,
        errorCode: EInvoiceApiErrorCode.NOT_VERIFIED_SMS_CODE
      })
    }

    return true
  }

  /**
   * e-Arşiv'e anonim olarak bağlanmak için kullanıcı adı ve şifre uygular.
   */
  async setAnonymousCredentials(): Promise<void> {
    const params: Record<string, string> = {
      rtype: 'json',
      assoscmd: 'kullaniciOner'
    }

    const data = await this.sendRequest<{ userid?: unknown }>(
      '/earsiv-services/esign',
      params
    )

    if (typeof data.userid !== 'string' || data.userid === '') {
      throw new EInvoiceApiError('Geçersiz anonim kullanıcı kimliği.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVALID_ANONYMOUS_USER_ID
      })
    }

    this.setCredentials({
      username: data.userid,
      password: '1'
    })
  }

  /**
   * Faturanın UUID'ini alır.
   * @param invoiceOrUuid Fatura veya faturanın UUID'i.
   */
  getInvoiceUuid(invoiceOrUuid: InvoiceOrUuid): string {
    if (typeof invoiceOrUuid === 'string') {
      return invoiceOrUuid
    }

    return invoiceOrUuid.uuid
  }

  /**
   * Faturaları onay durumuna göre filtreler.
   * @param invoices Filtrelenecek faturalar.
   * @param status Onay durumu.
   */
  filterBasicInvoicesByApprovalStatus(
    invoices: BasicInvoice[],
    status?: InvoiceApprovalStatus | string
  ): BasicInvoice[] {
    if (typeof status !== 'string') {
      return invoices
    }

    return invoices.filter((value) => status === value.approvalStatus)
  }

  private async sendRequest<T extends Record<string, unknown>>(
    url: string,
    params: Record<string, string>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const baseURL = this.getBaseURL()

    const {
      data,
      status: httpStatusCode,
      statusText: httpStatusText
    } = await axios.post<T>(
      url,
      qs.stringify(params),
      getAxiosRequestConfig({
        ...config,
        baseURL,
        headers: {
          ...EInvoiceApi.DEFAULT_HEADERS,
          Referrer: `${baseURL}${EInvoiceApi.REFERRER_PATH}`,
          ...config?.headers
        }
      })
    )

    if (!isPlainObject(data)) {
      throw new EInvoiceApiError('Geçersiz API cevabı.', {
        data,
        errorCode: EInvoiceApiErrorCode.INVALID_RESPONSE,
        httpStatusCode,
        httpStatusText
      })
    }

    if ('error' in data || (isPlainObject(data.data) && data.data.hata)) {
      throw new EInvoiceApiError('Bilinmeyen bir hata oluştu.', {
        data,
        errorCode: EInvoiceApiErrorCode.UNKNOWN_ERROR,
        httpStatusCode,
        httpStatusText
      })
    }

    return data
  }

  private getBaseURL(): string {
    return this.testMode ? EInvoiceApi.TEST_BASE_URL : EInvoiceApi.BASE_URL
  }

  private checkToken(): void {
    if (!this.token) {
      throw new EInvoiceTypeError(
        `Erişim jetonu bulunamadı. "${this.connect.name}", "${this.getAccessToken.name}" metodlarından birini kullanmayı deneyin.`
      )
    }
  }

  private checkCredentials(): void {
    if (!this.username || !this.password) {
      throw new EInvoiceTypeError(
        `Kullanıcı adı veya şifre tanımlanmadı. ${this.setCredentials.name}, ${this.setAnonymousCredentials.name} metodlarından birini kullanarak giriş bilgilerini sağlayın.`
      )
    }
  }
}

export default EInvoiceApi
