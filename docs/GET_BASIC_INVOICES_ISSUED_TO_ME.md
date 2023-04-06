### Adınıza Düzenlenen Faturaları Listeleme

e-Arşiv üzerinden adınıza düzenlenen faturaları listeler.

```typescript
import EInvoice, {
  BasicInvoice,
  FilterBasicInvoices,
  InvoiceApprovalStatus
} from 'e-fatura'

const filter: FilterBasicInvoices = {
  startDate: new Date(), // Tarih veya Gün/Ay/Yıl formatında tarih.
  endDate: '04/04/2023', // Tarih veya Gün/Ay/Yıl formatında tarih.
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
