### Detaylı Fatura Bilgilerini Alma

e-Arşiv üzerinde bulunan bir faturanın tüm bilgilerini (ürünler, fiyatlar, kdv vb.) getirir.

```typescript
import EInvoice, {
  Invoice,
  BasicInvoice,
  InvoiceOrUuid
} from 'e-fatura'

// Bulunacak fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const invoice: Invoice = await EInvoice.getInvoice(invoiceOrUuid)

console.log('Bulunan fatura:', invoice)
```
