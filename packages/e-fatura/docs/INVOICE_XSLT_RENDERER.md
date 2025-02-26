### XSLT Şablonu İle Fatura İşleme (Deneysel)

Belirli bir e-Arşiv faturasını XSLT şablonu ile derlemek için kullanılır.

```shell
yarn add tmp
```

🚨 **Bu özellik (XSLT şablonu ile fatura işleme) sadece meraklısı için geliştirilmiş bir özelliktir, gerçek ortamda kullanılması önerilmemektedir. e-Arşiv'in fatura tasarımını değiştirip alıcıya/satıcıya göndermeden önce <a href="https://www.gib.gov.tr/vergi_iletisim_merkezi" target="_blank">GİB İletişim Merkezi</a>'nden bilgi almanız önerilir. Bu işlemin sonucunda doğabilecek herhangi bir sorundan bu paket (e-fatura) ve bu paketi (e-fatura) geliştiren(ler) sorumlu tutulamaz.**

```typescript
import EInvoice, { InvoiceOrUuid } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const xsltRenderer = EInvoice.invoiceXsltRenderer(
  invoiceOrUuid,
  'XSLT şablonu dosya yolu', // path.join(__dirname, 'e-arsiv.xslt')
  {
    // Faturanın onay durumunu belirler.
    signed: true,
    // xsltproc komut satırı uygulaması seçenekleri.
    xsltprocOptions: {}
  }
)

// XSLT şablonu ile derlenen faturanın html çıktısını pdf'e çevirir.
xsltRenderer.toPdf()

// XSLT şablonu ile derlenen faturanın html çıktısını verir.
xsltRenderer.toHtml()

// XSLT şablonun kullandığı faturaya ait xml (ubl) çıktısını verir.
xsltRenderer.toXml()
```
