### Temel Fatura Bilgileri Alma

e-Arşiv üzerinden düzenlenen (oluşturulan) bir faturayı bulma.

```typescript
import EInvoice, {
  BasicInvoice,
  FilterBasicInvoices,
  InvoiceApprovalStatus
} from 'e-fatura'

// Faturanın hangi zaman aralığında
// ve hangi onay durumuna göre aranacağı
const filter: FilterBasicInvoices = {
  startDate: new Date(), // Tarih veya Gün/Ay/Yıl formatında tarih.
  endDate: '04/04/2023', // Tarih veya Gün/Ay/Yıl formatında tarih.
  approvalStatus: InvoiceApprovalStatus.UNAPPROVED // Onaylanmayan (imzalanmayan) faturalar.
}

// Bulunacak fatura veya faturaya ait UUID
const invoiceOrUuid: BasicInvoice | string = ''

const invoice: BasicInvoice = await EInvoice.findBasicInvoice(
  invoiceOrUuid,
  filter // Opsiyonel
)

console.log('Bulunan fatura:', invoice)
```
