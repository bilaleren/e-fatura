### Adınıza Düzenlenen Faturaları Listeleme

e-Arşiv üzerinden adınıza düzenlenen faturaları listeler.

```typescript
import EInvoice, {
  BasicInvoice,
  FilterBasicInvoices,
  InvoiceApprovalStatus
} from 'e-fatura'

const filter: FilterBasicInvoices = {
  startDate: new Date(), // Tarih (Date örneği) veya Gün/Ay/Yıl formatında bir dize.
  endDate: '04/04/2023', // Tarih (Date örneği) veya Gün/Ay/Yıl formatında bir dize.
  approvalStatus: InvoiceApprovalStatus.APPROVED // Onaylanan (imzalanan) faturalar.
}

const invoices: BasicInvoice[] = await EInvoice.getBasicInvoicesIssuedToMe(
  filter // Opsiyonel
)

console.log(
  'Adınıza düzenlenen faturalar:',
  invoices
)
```
