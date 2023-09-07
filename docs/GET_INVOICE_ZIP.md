### Faturanın ZIP Çıktısını Alma

Faturanın ZIP çıktısını alır.

```typescript
import fs from 'fs/promises'
import path from 'path'
import EInvoice, { BasicInvoice, InvoiceOrUuid } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const zipBuffer = await EInvoice.getInvoiceZip(
  invoiceOrUuid,
  false // Faturanın onay durumu: varsayılan true
)

const invoiceZipPath = path.join(
  __dirname,
  'Fatura.zip'
)

await fs.writeFile(invoiceZipPath, zipBuffer)
```
