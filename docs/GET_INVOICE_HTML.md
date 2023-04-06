### Faturanın HTML Çıktısını Alma.

Faturanın HTML çıktısını alır. HTML çıktısını yazıcı ile yazdırabilir ya da bir dosyaya kaydedebilirsiniz.

```typescript
import EInvoice, { BasicInvoice } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: BasicInvoice | string = ''

const invoiceHTML: string = await EInvoice.getInvoiceHTML(
  invoiceOrUuid,
  false, // Faturanın onay durumu: varsayılan true
  true  // window.print() komutunu html çıktısına ekler: varsayılan false
)

console.log('Fatura HTML:', invoiceHTML)
```
