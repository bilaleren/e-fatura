### Temel Fatura Bilgileri Alma

e-Arşiv üzerinden düzenlenen (oluşturulan) bir faturayı bulma.

```typescript
import EInvoice, {
  BasicInvoice,
  InvoiceOrUuid,
  FilterBasicInvoices,
  InvoiceApprovalStatus
} from 'e-fatura'

// Faturanın hangi zaman aralığında
// ve hangi onay durumuna göre aranacağı
const filter: FilterBasicInvoices = {
  startDate: new Date(), // Tarih (Date örneği) veya Gün/Ay/Yıl formatında bir dize.
  endDate: '04/04/2023', // Tarih (Date örneği) veya Gün/Ay/Yıl formatında bir dize.
  approvalStatus: InvoiceApprovalStatus.UNAPPROVED // Onaylanmayan (imzalanmayan) faturalar.
}

// Bulunacak fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const invoice: BasicInvoice = await EInvoice.findBasicInvoice(
  invoiceOrUuid,
  filter // Opsiyonel
)

console.log('Bulunan fatura:', invoice)
```
