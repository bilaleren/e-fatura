### Faturaları İmzalama

e-Arşiv üzerinde bulunan faturaları imzalama.

```typescript
import EInvoice, {
  BasicInvoice,
  SendSMSCodeResult
} from 'e-fatura'

// İmzalanacak faturanın içeriği.
const invoice: BasicInvoice = {}

// Fatura imzalamak için SMS ile doğrulama kodu gönderilir.
// Ayrıca, doğrulamaya ait işlem kimliği ve kodun gönderildiği telefon numarası geri döner.
const result: SendSMSCodeResult = await EInvoice.sendSMSCode()

console.log(`Doğrulama kodu ${result.phoneNumber} telefon numarasına gönderildi.`)

await EInvoice.signInvoices(
  '', // SMS ile gönderilen doğrulama kodu.
  result.oid,
  invoice // veya [invoice, invoice2, invoice3, ...]
)

console.log('Fatura başarılı bir şekilde imzalandı.')
```
