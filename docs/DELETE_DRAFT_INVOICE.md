### Fatura Silme

e-Arşiv üzerinde taslak olarak bulunan bir faturayı siler.

```typescript
import EInvoice, { BasicInvoice } from 'e-fatura'

// Silinecek fatura
const invoice: BasicInvoice = {}

const deleteResult: boolean = await EInvoice.deleteDraftInvoice(
  invoice,
  'İade işlemi' // silme nedeni
)

console.log('Fatura silme sonucu:', deleteResult)
```
