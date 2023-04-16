import type InvoiceType from './enums/InvoiceType'
import type EInvoiceCountry from './enums/EInvoiceCountry'
import type EInvoiceUnitType from './enums/EInvoiceUnitType'
import type EInvoiceCurrencyType from './enums/EInvoiceCurrencyType'
import type InvoiceApprovalStatus from './enums/InvoiceApprovalStatus'

type OtherProps = Record<string, unknown>

export type DateOrDateString = Date | string

export type InvoiceOrUuid = BasicInvoice | string

export interface Credentials {
  username: string | null
  password: string | null
}

export interface FilterBasicInvoices {
  /**
   * Başlangıç tarihi.
   * @default new Date()
   */
  startDate?: DateOrDateString

  /**
   * Bitiş tarihi.
   * @default new Date()
   */
  endDate?: DateOrDateString

  /**
   * Belgelerin onay durumu.
   * @default undefined
   */
  approvalStatus?: InvoiceApprovalStatus | string
}

export interface Invoice {
  /**
   * Fatura kimliği.
   * @alias 'faturaUuid'
   */
  uuid: string

  /**
   * Faturaya ait belge numarası.
   * @alias 'belgeNumarasi'
   */
  documentNumber: string

  /**
   * Faturanın düzenlendiği tarih.
   * @alias 'faturaTarihi'
   */
  date: string

  /**
   * Faturanın düzenlendiği zaman.
   * @alias 'saat'
   */
  time: string

  /**
   * Faturanın kullanacağı para birimi.
   * @alias 'paraBirimi'
   */
  currency: EInvoiceCurrencyType

  /**
   * Döviz kuru.
   * @alias 'dovzTLkur'
   */
  currencyRate: number

  /**
   * Fatura tipi.
   * @alias 'faturaTipi'
   */
  invoiceType: InvoiceType

  /**
   * @alias 'hangiTip'
   */
  whichType: string | undefined

  /**
   * Vergi kimlik no veya T.C kimlik no.
   * @alias 'vknTckn'
   */
  taxOrIdentityNumber: string

  /**
   * Alıcının unvanı.
   * @alias 'aliciUnvan'
   */
  buyerTitle: string

  /**
   * Alıcının adı.
   * @alias 'aliciAdi'
   */
  buyerFirstName: string

  /**
   * Alıcının soyadı.
   * @alias 'aliciSoyadi'
   */
  buyerLastName: string

  /**
   * Alıcının oturduğu binanın adı.
   * @alias 'binaAdi'
   */
  buildingName: string

  /**
   * Alıcının oturduğu binanın numarası.
   * @alias 'binaNo'
   */
  buildingNumber: string

  /**
   * Alıcının oturduğu dairenin kapı numarası.
   * @alias 'kapiNo'
   */
  doorNumber: string

  /**
   * Alıcının yaşadığı kasaba veya köy.
   * @alias 'kasabaKoy'
   */
  town: string

  /**
   * Alıcının vergi dairesi.
   * @alias 'vergiDairesi'
   */
  taxOffice: string

  /**
   * Alıcının bulunduğu ülke.
   * @alias 'ulke'
   */
  country: EInvoiceCountry

  /**
   * Alıcının tam adresi.
   * @alias 'bulvarcaddesokak'
   */
  fullAddress: string

  /**
   * Alıcının mahalle, semt veya ilçe bilgisi.
   * @alias 'mahalleSemtIlce'
   */
  district: string

  /**
   * Alıcının yaşadığı şehir.
   * @alias 'sehir'
   */
  city: string

  /**
   * Posta kodu.
   * @alias 'postaKodu'
   */
  postNumber: string

  /**
   * Alıcının telefon numarası.
   * @alias 'tel'
   */
  phoneNumber: string

  /**
   * Alıcının faks numarası.
   * @alias 'fax'
   */
  faxNumber: string

  /**
   * Alıcının e-posta adresi.
   * @alias 'eposta'
   */
  email: string

  /**
   * Alıcının website adresi.
   * @alias 'websitesi'
   */
  website: string

  /**
   * İadeye konu olan faturaların listesi.
   * @alias 'iadeTable',
   */
  refundTable: (Required<RefundInvoice> & OtherProps)[] | undefined

  /**
   * Özel matrah tutarı.
   * @alias 'ozelMatrahTutari'
   */
  specialBaseAmount: number

  /**
   * Özel matrah oranı.
   * @alias 'ozelMatrahOrani'
   */
  specialBasePercent: number

  /**
   * Özel matrah vergi tutarı.
   * @alias 'ozelMatrahVergiTutari'
   */
  specialBaseTaxAmount: number

  /**
   * Vergi çeşidi.
   * @alias 'vergiCesidi'
   */
  taxType: string | undefined

  /**
   * Ürün/hizmet listesi.
   * @alias 'malHizmetTable'
   */
  products: (Required<InvoiceProduct> & OtherProps)[]

  /**
   * @alias 'tip',
   * @default İskonto
   */
  type: string

  /**
   * @alias 'matrah'
   */
  base: number

  /**
   * Ürünlerin toplam fiyatı.
   * @alias 'malhizmetToplamTutari'
   */
  productsTotalPrice: number

  /**
   * Ürünlere uygulanan toplam indirim veya arttırım.
   * @alias 'toplamIskonto'
   */
  totalDiscountOrIncrement: number

  /**
   * Ürünlerin KDV toplamı.
   * @alias 'hesaplanankdv'
   */
  calculatedVAT: number

  /**
   * Ürünlere uygulanan vergilerin toplamı.
   * @alias 'vergilerToplami'
   */
  totalTaxes: number

  /**
   * Ürünlerin fiyat, kdv, vergi, indirim ve arttırım değerlerinin toplamı.
   * @alias 'vergilerDahilToplamTutar'
   */
  includedTaxesTotalPrice: number

  /**
   * Ödenecek toplam tutar.
   * @alias 'odenecekTutar'
   */
  paymentPrice: number

  /**
   * Faturaya ait not.
   * @alias 'not'
   */
  note: string

  /**
   * Sipariş numarası.
   * @alias 'siparisNumarasi'
   */
  orderNumber: string | undefined

  /**
   * Sipariş tarihi.
   * @alias 'siparisTarihi'
   */
  orderDate: string | undefined

  /**
   * İrsaliye numarası.
   * @alias 'irsaliyeNumarasi'
   */
  waybillNumber: string | undefined

  /**
   * İrsaliye tarihi.
   * @alias 'irsaliyeTarihi'
   */
  waybillDate: string | undefined

  /**
   * Fiş numarası.
   * @alias 'fisNo'
   */
  receiptNumber: string | undefined

  /**
   * Fiş tarihi.
   * @alias 'fisTarihi'
   * @default ''
   */
  receiptDate: string | undefined

  /**
   * Fiş saati.
   * @alias 'fisSaati'
   */
  receiptTime: string | undefined

  /**
   * Fiş türü.
   * @alias 'fisTipi'
   */
  receiptType: string | undefined

  /**
   * Z raporu numarası.
   * @alias 'zRaporNo'
   */
  zReportNumber: string | undefined

  /**
   * Ödeme kaydedici cihaz numarası.
   * @alias 'okcSeriNo'
   */
  okcSerialNumber: string | undefined

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export interface BasicInvoice {
  /**
   * Fatura kimliği.
   * @alias 'ettn'
   */
  uuid: string

  /**
   * Belge numarası.
   * @alias 'belgeNumarasi'
   */
  documentNumber: string

  /**
   * T.C Kimlik veya Vergi Kimlik numarası.
   * @alias 'aliciVknTckn'
   */
  taxOrIdentityNumber: string

  /**
   * Alıcının unvanı veya tam adı.
   * @alias 'aliciUnvanAdSoyad'
   */
  buyerTitleOrFullName: string

  /**
   * Belgenın düzenlenme tarihi.
   * @alias 'belgeTarihi'
   */
  documentDate: string

  /**
   * Belgeninin türü.
   * @alias 'belgeTuru'
   */
  documentType: string

  /**
   * Belgenin onay durumu.
   * @alias 'onayDurumu'
   */
  approvalStatus: InvoiceApprovalStatus | string

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export interface UserInformation {
  /**
   * Unvan (Tüzel Kişiler için).
   * @alias 'unvan'
   */
  title: string

  /**
   * Ad (Gerçek Kişiler İçin).
   * @alias 'ad'
   */
  firstName: string

  /**
   * Soyad (Gerçek Kişiler İçin).
   * @alias 'soyad'
   */
  lastName: string

  /**
   * Vergi kimlik no veya T.C kimlik no.
   * @alias 'vknTckn'
   */
  taxOrIdentityNumber: string

  /**
   * E-posta adresi.
   * @alias 'ePostaAdresi'
   */
  email: string

  /**
   * Website adresi.
   * @alias 'webSitesiAdresi'
   */
  website: string

  /**
   * Sicil numarası.
   * @alias 'sicilNo'
   */
  recordNumber: string

  /**
   * Mersis numarası.
   * @alias 'mersisNo'
   */
  mersisNumber: string

  /**
   * Vergi dairesi.
   * @alias 'vergiDairesi'
   */
  taxOffice: string

  /**
   * Cadde.
   * @alias 'cadde'
   */
  street: string

  /**
   * Bina/Apartman adı.
   * @alias 'apartmanAdi'
   */
  buildingName: string

  /**
   * Bina/Apartman numarası.
   * @alias 'apartmanNo'
   */
  buildingNumber: string

  /**
   * Kapı numarası.
   * @alias 'kapiNo'
   */
  doorNumber: string

  /**
   * Kasaba/Köy.
   * @alias 'kasaba'
   */
  town: string

  /**
   * Şehir.
   * @alias 'il'
   */
  city: string

  /**
   * İlçe.
   * @alias 'ilce'
   */
  district: string

  /**
   * Posta kodu.
   * @alias 'postaKodu'
   */
  postNumber: string

  /**
   * Ülke.
   * @alias 'ulke'
   */
  country: EInvoiceCountry

  /**
   * Telefon numarası.
   * @alias 'telNo'
   */
  phoneNumber: string

  /**
   * Faks numarası.
   * @alias 'faksNo'
   */
  faxNumber: string

  /**
   * İş merkezi.
   * @alias 'isMerkezi'
   */
  businessCenter: string

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export interface CompanyInformation {
  /**
   * Unvan (Tüzel Kişiler için).
   * @alias 'unvan'
   */
  title: string

  /**
   * Ad (Gerçek Kişiler İçin)
   * @alias 'adi'
   */
  firstName: string

  /**
   * Soyad (Gerçek Kişiler İçin).
   * @alias 'soyadi'
   */
  lastName: string

  /**
   * Vergi dairesi
   * @alias 'taxOffice'
   */
  taxOffice: string

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export interface RefundInvoice {
  /**
   * İadeye konu olan faturanın numarası.
   * @alias 'faturaNo'
   */
  invoiceNumber: string

  /**
   * İadeye konu olan faturanın düzenlendiği tarih.
   * @alias 'duzenlenmeTarihi'
   * @default DD/MM/YYYY
   */
  date?: DateOrDateString

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export interface InvoiceProduct {
  /**
   * Ürün/Hizmet adı.
   * @alias 'malHizmet'
   */
  name: string

  /**
   * Ürün/Hizmet adedi.
   * @alias 'miktar'
   * @default 1
   */
  quantity?: number

  /**
   * Birim türü.
   * @alias 'birim'
   * @default UnitType.ADET
   */
  unitType?: EInvoiceUnitType

  /**
   * Birim fiyat.
   * @alias 'birimFiyat'
   */
  unitPrice: number

  /**
   * KDV hariç toplam fiyat. (unitPrice * quantity)
   * @alias 'fiyat'
   */
  price: number

  /**
   * @alias 'iskontoArttm'
   * @default İskonto
   */
  discountOrIncrement?: 'İskonto' | 'Arttırım' | string

  /**
   * İndirim veya arttırım oranı.
   * @alias 'iskontoOrani'
   * @default 0
   */
  discountOrIncrementRate?: number

  /**
   * İndirim veya arttırım tutarı.
   * @alias 'iskontoTutari'
   * @default 0
   */
  discountOrIncrementAmount?: number

  /**
   * İndirimin veya arttırımın uygulanma nedeni.
   * @alias 'iskontoNedeni'
   * @default ''
   */
  discountOrIncrementReason?: string

  /**
   * Toplam tutar. KDV ve diğer ücretlerin toplamı.
   * @alias 'malHizmetTutari'
   */
  totalAmount: number

  /**
   * KDV oranı.
   * @alias 'kdvOrani'
   * @default 0
   */
  vatRate?: number

  /**
   * Vergi oranı.
   * @alias 'vergiOrani'
   * @default 0
   */
  taxRate?: number

  /**
   * KDV tutarı. (price / 100) * taxRate
   * @alias 'kdvTutari'
   * @default 0
   */
  vatAmount?: number

  /**
   * @alias 'vergininKdvTutari'
   * @default 0
   */
  vatAmountOfTax?: number

  /**
   * Özel matrah tutarı
   * @alias 'ozelMatrahTutari'
   * @default 0
   */
  specialBaseAmount?: number

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export interface CreateDraftInvoicePayload {
  /**
   * Fatura kimliği.
   * @alias 'faturaUuid'
   */
  uuid?: string

  /**
   * Faturaya ait belge numarası.
   * @alias 'belgeNumarasi'
   * @default ''
   */
  documentNumber?: string

  /**
   * Faturanın düzenlendiği tarih.
   * @alias 'faturaTarihi'
   * @default DD/MM/YYYY
   */
  date?: DateOrDateString

  /**
   * Faturanın düzenlendiği saat.
   * @alias 'saat'
   * @default HH:MM:SS
   */
  time?: DateOrDateString

  /**
   * Faturanın kullanacağı para birimi.
   * @alias 'paraBirimi'
   * @default CurrencyType.TURK_LIRASI
   */
  currency?: EInvoiceCurrencyType

  /**
   * Döviz kuru. `curreny` alanı `EInvoiceCurrencyType.TURK_LIRASI` olarak belirtildiğinde kullanılamaz.
   * @alias 'dovzTLkur'
   * @default 0
   */
  currencyRate?: number

  /**
   * Fatura tipi.
   * @alias 'faturaTipi'
   * @default InvoiceType.SATIS
   */
  invoiceType?: InvoiceType

  /**
   * @alias 'hangiTip'
   * @default 5000/30000
   */
  whichType?: string

  /**
   * Vergi kimlik no veya T.C kimlik no.
   * @alias 'vknTckn'
   * @default 11111111111
   */
  taxOrIdentityNumber?: string

  /**
   * Alıcının unvanı.
   * @alias 'aliciUnvan'
   * @default ''
   */
  buyerTitle?: string

  /**
   * Alıcının adı.
   * @alias 'aliciAdi'
   * @default ''
   */
  buyerFirstName?: string

  /**
   * Alıcının soyadı.
   * @alias 'aliciSoyadi'
   * @default ''
   */
  buyerLastName?: string

  /**
   * Alıcının oturduğu binanın adı.
   * @alias 'binaAdi'
   * @default ''
   */
  buildingName?: string

  /**
   * Alıcının oturduğu binanın numarası.
   * @alias 'binaNo'
   * @default ''
   */
  buildingNumber?: string

  /**
   * Alıcının oturduğu dairenin kapı numarası.
   * @alias 'kapiNo'
   * @default ''
   */
  doorNumber?: string

  /**
   * Alıcının yaşadığı kasaba veya köy.
   * @alias 'kasabaKoy'
   * @default ''
   */
  town?: string

  /**
   * Alıcının vergi dairesi.
   * @alias 'vergiDairesi'
   * @default ''
   */
  taxOffice?: string

  /**
   * Alıcının bulunduğu ülke.
   * @alias 'ulke'
   * @default Country.TURKIYE
   */
  country?: EInvoiceCountry

  /**
   * Alıcının tam adresi.
   * @alias 'bulvarcaddesokak'
   * @default ''
   */
  fullAddress?: string

  /**
   * Alıcının mahalle, semt veya ilçe bilgisi.
   * @alias 'mahalleSemtIlce'
   * @default ''
   */
  district?: string

  /**
   * Alıcının yaşadığı şehir.
   * @alias 'sehir'
   * @default ''
   */
  city?: string

  /**
   * Posta kodu.
   * @alias 'postaKodu'
   * @default ''
   */
  postNumber?: string

  /**
   * Alıcının telefon numarası.
   * @alias 'tel'
   * @default ''
   */
  phoneNumber?: string

  /**
   * Alıcının faks numarası.
   * @alias 'fax'
   * @default ''
   */
  faxNumber?: string

  /**
   * Alıcının e-posta adresi.
   * @alias 'eposta'
   * @default ''
   */
  email?: string

  /**
   * Alıcının website adresi.
   * @alias 'websitesi'
   * @default ''
   */
  website?: string

  /**
   * "invoiceType" alanı "IADE" olarak ayarlandığında, iadeye konu olan faturaların listesi.
   * @alias 'iadeTable',
   * @default []
   */
  refundTable?: RefundInvoice[]

  /**
   * Özel matrah tutarı.
   * @alias 'ozelMatrahTutari'
   * @default 0
   */
  specialBaseAmount?: number

  /**
   * Özel matrah oranı.
   * @alias 'ozelMatrahOrani'
   * @default 0
   */
  specialBasePercent?: number

  /**
   * Özel matrah vergi tutarı.
   * @alias 'ozelMatrahVergiTutari'
   * @default 0
   */
  specialBaseTaxAmount?: number

  /**
   * Vergi çeşidi.
   * @alias 'vergiCesidi'
   * @default ' '
   */
  taxType?: string

  /**
   * Fatura edilecek ürün/hizmet listesi.
   * @alias 'malHizmetTable'
   */
  products: InvoiceProduct[]

  /**
   * @alias 'tip',
   * @default İskonto
   */
  type?: string

  /**
   * Vergiye tabi tutar/değer. Örn. ((calculatedVAT / (KDV oranı / 100))
   * @alias 'matrah'
   */
  base: number

  /**
   * Ürünlerin toplam fiyatı.
   * @alias 'malhizmetToplamTutari'
   */
  productsTotalPrice: number

  /**
   * Ürünlere uygulanan toplam indirim veya arttırım.
   * @alias 'toplamIskonto'
   * @default 0
   */
  totalDiscountOrIncrement?: number

  /**
   * Ürünlerin KDV toplamı.
   * @alias 'hesaplanankdv'
   * @default 0
   */
  calculatedVAT?: number

  /**
   * Ürünlere uygulanan vergilerin toplamı.
   * @alias 'vergilerToplami'
   * @default 0
   */
  totalTaxes?: number

  /**
   * Ürünlerin fiyat, kdv, vergi, indirim ve arttırım değerlerinin toplamı.
   * @alias 'vergilerDahilToplamTutar'
   */
  includedTaxesTotalPrice: number

  /**
   * Ödenecek toplam tutar.
   * @alias 'odenecekTutar'
   */
  paymentPrice: number

  /**
   * Faturaya ait not.
   * @alias 'not'
   * @default ''
   */
  note?: string

  /**
   * Sipariş numarası.
   * @alias 'siparisNumarasi'
   * @default ''
   */
  orderNumber?: string

  /**
   * Sipariş tarihi.
   * @alias 'siparisTarihi'
   * @default ''
   */
  orderDate?: DateOrDateString

  /**
   * İrsaliye numarası.
   * @alias 'irsaliyeNumarasi'
   * @default ''
   */
  waybillNumber?: string

  /**
   * İrsaliye tarihi.
   * @alias 'irsaliyeTarihi'
   * @default ''
   */
  waybillDate?: DateOrDateString

  /**
   * Fiş numarası.
   * @alias 'fisNo'
   * @default ''
   */
  receiptNumber?: string

  /**
   * Fiş tarihi.
   * @alias 'fisTarihi'
   * @default ''
   */
  receiptDate?: DateOrDateString

  /**
   * Fiş saati.
   * @alias 'fisSaati'
   * @default ''
   */
  receiptTime?: string

  /**
   * Fiş türü.
   * @alias 'fisTipi'
   * @default ''
   */
  receiptType?: string

  /**
   * Z raporu numarası.
   * @alias 'zRaporNo'
   * @default ''
   */
  zReportNumber?: string

  /**
   * Ödeme kaydedici cihaz numarası.
   * @alias 'okcSeriNo'
   * @default ''
   */
  okcSerialNumber?: string

  /**
   * Diğer alanlar.
   */
  [p: string]: unknown
}

export type UpdateDraftInvoicePayload = Partial<Invoice> & OtherProps

export type UpdateUserInformationPayload = Partial<UserInformation> & OtherProps
