### Faturanın PDF Çıktısını Alma

Faturanın PDF çıktısını alır.

```shell
yarn add puppeteer-core
```

Faturanın PDF çıktısını alabilmek için [Puppeteer](https://pptr.dev/guides/installation) adlı paket kullanılmaktadır. Bu paket sayesinde faturanızın HTML çıktısını tarayıcı penceresine aktararak PDF çıktısını elde edebiliyoruz.

```typescript
import fs from 'fs/promises'
import path from 'path'
import EInvoice, { BasicInvoice, InvoiceOrUuid } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const pdfBuffer = await EInvoice.getInvoicePdf(
  invoiceOrUuid,
  false, // Faturanın onay durumu: varsayılan true
  {
    format: 'A4',
    margin: {
      top: 10,
      left: 10,
      right: 10,
      bottom: 10
    }
  } // PDF seçenekleri
)

const invoicePdfPath = path.join(
  __dirname,
  'Fatura.pdf'
)

await fs.writeFile(invoicePdfPath, pdfBuffer)
```
