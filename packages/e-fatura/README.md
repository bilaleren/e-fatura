# 🧾 e-Fatura

[![License MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](https://github.com/bilaleren/e-fatura/blob/master/LICENCE)
[![NPM](https://img.shields.io/npm/v/e-fatura.svg)](https://www.npmjs.com/package/e-fatura)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm downloads](https://img.shields.io/npm/dt/e-fatura.svg)](#kurulum)

Bu paket, Node.js aracılığıyla e-Arşiv üzerinden fatura oluşturma, düzenleme, imzalama gibi işlemleri yapabilmenize olanak sağlar.

🚨 Bu paket **vergiye tabî olan belge** oluşturur. Hiç bir sorumluluk kabul edilmez ve ne yaptığınızdan emin olana kadar **EInvoice.setTestMode(true)** kullanarak test modu açık şekilde test verileriyle işlem yapmanız önerilir.

## Kurulum

```shell
yarn add e-fatura
```

veya

```shell
npm i e-fatura
```

## Paket Yapısı

```typescript
import EInvoice, {
  getDateFormat, // Tarih formatını alır (Gün/Ay/Yıl veya Saat:Dakika:Saniye)
  paymentPriceToText, // Ödenecek tutarı metine dönüştürür
  isEInvoiceApiResponseError, // e-Arşiv HTTP yanıtının hata içerip içermediğini kontrol eder
  XsltRenderer, // Faturayı XSLT şablonu ile işler
  EInvoiceApi, // Soyut hata sınıfı
  EInvoiceError, // Tür hata sınıfı
  EInvoiceTypeError, // Tür hata sınıfı
  EInvoiceApiError, // API hata sınıfı
  EInvoiceMissingTokenError, // Eksik veya hatalı erişim jetonu hata sınıfı
  EInvoiceMissingCredentialsError, // Eksik veya hatalı giriş bilgileri hata sınıfı
  InvoiceType, // Fatura türü
  EInvoiceCountry, // Ülkeler
  EInvoiceApiErrorCode, // API hata kodları
  InvoiceApprovalStatus, // Fatura onay durumu
  EInvoiceCurrencyType, // Param birimi
  EInvoiceUnitType // Birim türü
  // ... Typescript türleri
} from 'e-fatura'
```

## Özellikler

- [Fatura oluşturma.](docs/CREATE_DRAFT_INVOICE.md)
- [Faturaları listeleme.](docs/GET_BASIC_INVOICES.md)
- [Faturaları imzalama.](docs/SIGN_INVOICES.md)
- [Adınıza düzenlenen faturaları listeleme.](docs/GET_BASIC_INVOICES_ISSUED_TO_ME.md)
- [Temel fatura bilgileri alma.](docs/FIND_BASIC_INVOICE.md)
- [Detaylı fatura bilgilerini alma.](docs/GET_INVOICE.md)
- [Fatura güncelleme.](docs/UPDATE_DRAFT_INVOICE.md)
- [Faturanın HTML çıktısını alma.](docs/GET_INVOICE_HTML.md)
- [Faturanın PDF çıktısını alma.](docs/GET_INVOICE_PDF.md)
- [Faturanın ZIP çıktısını alma.](docs/GET_INVOICE_ZIP.md)
- [Faturanın XML çıktısını alma.](docs/GET_INVOICE_XML.md)
- [Faturanın indirme bağlantısını alma.](docs/GET_INVOICE_DOWNLOAD_URL.md)
- [Fatura silme.](docs/DELETE_DRAFT_INVOICE.md)
- [Fatura iptal etme.](docs/CREATE_CANCEL_REQUEST_FOR_INVOICE.md)
- [Kullanıcı (şirket) bilgilerini getirme.](docs/GET_USER_INFORMATION.md)
- [Kullanıcı (şirket) bilgilerini güncelleme.](docs/UPDATE_USER_INFORMATION.md)
- [XSLT şablonu ile fatura işleme. (Deneysel)](docs/INVOICE_XSLT_RENDERER.md)
- [Komut satırı arayüzü (CLI) uygulaması. (Yeni)](https://github.com/bilaleren/e-fatura/blob/master/packages/e-fatura-cli/README.md)

## Kullanım

**Kendi verileriniz ile test etmek için:**

https://earsivportal.efatura.gov.tr/intragiris.html

**Test hesaplarıyla test etmek için:**

https://earsivportaltest.efatura.gov.tr/login.jsp

### Test ortamı için kullanım;

```typescript
import EInvoice from 'e-fatura'

await EInvoice.connect({
  anonymous: true
})

// ... Diğer işlemler. Fatura oluşturma, listeleme, düzenleme vb.

// e-Arşiv oturumunu sonlandırır.
await EInvoice.logout()
```

### Ürün ortamı için kullanım;

```typescript
import EInvoice from 'e-fatura'

// Muhasebecinizden aldığınız giriş bilgileri.
await EInvoice.connect({
  username: 'kullanıcı kodu|adı',
  password: 'şifre'
})

// ... Diğer işlemler. Fatura oluşturma, listeleme, düzenleme vb.

// e-Arşiv oturumunu sonlandırır.
await EInvoice.logout()
```

## Hata Ayıklama

API ve tür hatalarının ayıklanması.

```typescript
import axios from 'axios'
import EInvoice, {
  EInvoiceApiError,
  EInvoiceTypeError,
  EInvoiceApiErrorCode,
  EInvoiceMissingTokenError,
  EInvoiceMissingCredentialsError
} from 'e-fatura'

try {
  // EInvoice.*()
} catch (e) {
  if (e instanceof EInvoiceTypeError) {
    console.error('Tür hatası meydana geldi:', e)
  } else if (e instanceof EInvoiceMissingTokenError) {
    console.error('Erişim jetonu sağlanmadı.')
  } else if (e instanceof EInvoiceMissingCredentialsError) {
    console.error('Giriş bilgileri sağlanmadı veya eksik sağlandı:', e.credentials)
  } else if (e instanceof EInvoiceApiError) {
    switch (e.errorCode) {
      case EInvoiceApiErrorCode.UNKNOWN_ERROR:
        console.error('Bilinmeyen bir hata oluştu:', e.response)
        break
      case EInvoiceApiErrorCode.INVALID_RESPONSE:
        console.error('Geçersiz API cevabı:', e.response)
        break
      case EInvoiceApiErrorCode.INVALID_ACCESS_TOKEN:
        console.error('Geçersiz erişim jetonu:', e.response)
        break
      case EInvoiceApiErrorCode.BASIC_INVOICE_NOT_CREATED:
        console.error('Basit fatura oluşturulamadı:', e.response)
      // ...
    }
  } else if (axios.isAxiosError(e)) {
    console.error('Axios hatası meydana geldi:', e)
  } else {
    console.error('Bilinmeyen bir hata meydana geldi:', e)
  }
}
```

> Diğer API hata kodları için [EInvoiceApiErrorCode.ts](https://github.com/bilaleren/e-fatura/blob/master/packages/e-fatura/src/enums/EInvoiceApiErrorCode.ts) dosyasına bakabilirsiniz.

#### Ayrıca

Bu proje Furkan Kadıoğlu'nun [efatura](https://github.com/furkankadioglu/efatura) projesinden yola çıkılarak Node.js'e uyarlanmıştır.
