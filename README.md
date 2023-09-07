# 🧾 e-Fatura

[![License MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](https://github.com/bilaleren/e-fatura/blob/master/LICENCE)
[![NPM](https://img.shields.io/npm/v/e-fatura.svg)](https://www.npmjs.com/package/e-fatura)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm downloads](https://img.shields.io/npm/dt/e-fatura.svg)](#kurulum)

Bu paket, Node.js aracılığıyla e-Arşiv üzerinden fatura oluşturma, düzenleme, imzalama gibi işlemleri yapabilmenize olanak sağlar.

🚨 Bu paket **vergiye tabi olan belge** oluşturur, hiç bir sorumluluk kabul edilmez ve ne yaptığınızdan emin olana kadar **EInvoice.setTestMode(true)** kullanarak test modu açık şekilde test verileriyle işlem yapmanız önerilir.

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
  EInvoiceCountry, // Ülkeler
  EInvoiceApi, // e-Arşiv API servisi
  EInvoiceTypeError, // Tür hata sınıfı
  EInvoiceApiError, // API hata sınıfı
  InvoiceType, // Fatura türü
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
- [Kullanıcı (şirket) bilgilerini çekme.](docs/GET_USER_INFORMATION.md)
- [Kullanıcı (şirket) bilgilerini güncelleme.](docs/UPDATE_USER_INFORMATION.md)
- [SMS ile Fatura doğrulama ve onaylama.](docs/SIGN_INVOICE_VIA_SMS.md)

## Kullanım

**Kendi verileriniz ile test etmek için:**

https://earsivportal.efatura.gov.tr/intragiris.html

**Test hesaplarıyla test etmek için:**

https://earsivportaltest.efatura.gov.tr/login.jsp

Test ortamı için kullanım örneği;

```typescript
import EInvoice from 'e-fatura'

// Test modunu aktif/deaktif eder.
EInvoice.setTestMode(true) // varsayılan olarak false

// Anonim kullanıcı bilgileri atar.
await EInvoice.setAnonymousCredentials()

// e-Arşive bağlanır.
await EInvoice.connect() // veya EInvoice.getAccessToken()

// ... Diğer işlemler. Fatura oluşturma, listeleme, düzenleme vb.

// e-Arşiv oturumunu sonlandırır.
await EInvoice.logout()
```

Ürün ortamı için kullanım örneği;

```typescript
import EInvoice from 'e-fatura'

// Test modunu aktif/deaktif eder.
EInvoice.setTestMode(false) // varsayılan olarak false

// Muhasebecinizden aldığınız giriş bilgileri.
EInvoice.setCredentials({
  username: 'kullanıcı kodu|adı',
  password: 'şifre'
})

// e-Arşive bağlanır.
await EInvoice.connect() // veya EInvoice.getAccessToken()

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
  EInvoiceApiErrorCode
} from 'e-fatura'

try {
  await EInvoice.createDraftInvoice({})
  // veya EInvoice.*()
} catch (e) {
  if (e instanceof EInvoiceTypeError) {
    console.error('Tür hatası meydana geldi:', e)
  } else if (e instanceof EInvoiceApiError) {
    const response = e.getResponse()

    switch (e.errorCode) {
      case EInvoiceApiErrorCode.UNKNOWN_ERROR:
        console.error('Bilinmeyen bir hata oluştu:', response)
        break
      case EInvoiceApiErrorCode.INVALID_RESPONSE:
        console.error('Geçersiz API cevabı:', response)
        break
      case EInvoiceApiErrorCode.INVALID_ACCESS_TOKEN:
        console.error('Geçersiz erişim jetonu:', response)
        break
      case EInvoiceApiErrorCode.BASIC_INVOICE_NOT_CREATED:
        console.error('Basit fatura oluşturulamadı:', response)
      // ...
    }
  } else if (axios.isAxiosError(e)) {
    console.error('Axios hatası meydana geldi:', e)
  } else {
    console.error('Bilinmeyen bir hata meydana geldi:', e)
  }
}
```

Not: Diğer API hata kodları için [EInvoiceApiErrorCode.ts](src/enums/EInvoiceApiErrorCode.ts) dosyasına bakabilirsiniz.

#### Ayrıca

Bu proje Furkan Kadıoğlu'nun [efatura](https://github.com/furkankadioglu/efatura) projesinden yola çıkılarak Node.js'e uyarlanmıştır.
