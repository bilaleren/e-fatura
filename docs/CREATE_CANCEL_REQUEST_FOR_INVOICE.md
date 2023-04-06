### Fatura İptal Etme

e-Arşiv fatura için iptal talebi oluşturma.

```typescript
import EInvoice, { BasicInvoice } from 'e-fatura'

// İptal talebi oluşturulacak fatura
const invoice: BasicInvoice = {}

const cancelRequestResult: boolean = await EInvoice.createCancelRequestForInvoice(
  invoice,
  'İade işlemi' // İpta talebi nedeni
)

console.log(
  'Fatura iptal talebi sonucu:',
  cancelRequestResult
)
```
