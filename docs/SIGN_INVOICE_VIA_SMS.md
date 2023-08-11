### SMS ile Fatura Doğrulama ve Onaylama

e-Arşiv üzerinden belirli bir faturayı imzalama.

```typescript
import EInvoice, { BasicInvoice } from 'e-fatura'

// İmzalanacak faturanın içeriği.
const invoiceToBeSigned: BasicInvoice = {}

// e-Arşiv üzerinde kayıtlı olan telefon numarasına
// doğrulama kodu gönderir ve işlem kimliğini geri döner.
const operationId: string = await EInvoice.sendSMSCode()

await EInvoice.verifySMSCode(
  '', // SMS ile gönderilen doğrulama kodu.
  operationId,
  invoiceToBeSigned
)

console.log('Fatura başarılı bir şekilde imzalandı.')
```
