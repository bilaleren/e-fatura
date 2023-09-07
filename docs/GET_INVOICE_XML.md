### Faturanın XML Çıktısını Alma

Faturanın XML (UBL olarak da geçer) çıktısını alır.

```shell
yarn add fflate
```

Faturanın XML dosyasını e-Arşiv üzerinde bulunan zip dosyasından çıkarmak için [fflate](https://www.npmjs.com/package/fflate) adlı paket kullanılır.

```typescript
import fs from 'fs/promises'
import path from 'path'
import EInvoice, { BasicInvoice, InvoiceOrUuid } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const xmlBuffer = await EInvoice.getInvoiceXml(
  invoiceOrUuid,
  false // Faturanın onay durumu: varsayılan true
)

const invoiceXmlPath = path.join(
  __dirname,
  'Fatura.xml'
)

await fs.writeFile(invoiceXmlPath, xmlBuffer)
```
