### Faturanın PDF Çıktısını Alma

Faturanın PDF çıktısını alır.

```shell
yarn add puppeteer
```

Faturanın PDF çıktısını alabilmek için [Puppeteer](https://pptr.dev/) adlı paket kullanılmaktadır. Bu paket sayesinde faturanızın HTML çıktısını tarayıcı penceresine aktararak PDF çıktısını elde edebiliyoruz.

[Puppeteer](https://pptr.dev/) paketi, [Chromium](https://www.chromium.org/Home/) projesini kullanır. [Chromium'u](https://www.chromium.org/Home/) makinenize kurmanız gerekmektedir. Daha fazlası için [pdf-example.js](../examples/pdf-example.js) ve [Dockerfile](../Dockerfile) dosyalarına bakabilirsiniz.

```typescript
import fs from 'fs/promises'
import path from 'path'
import EInvoice, { BasicInvoice } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: BasicInvoice | string = ''

const pdfBuffer: Buffer = await EInvoice.getInvoicePDF(
  invoiceOrUuid,
  false // Faturanın onay durumu: varsayılan true
)

const invoicePdfPath = path.join(
  __dirname,
  'Fatura.pdf'
)

await fs.writeFile(invoicePdfPath, pdfBuffer)
```
