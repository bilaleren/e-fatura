### Fatura Güncelleme

e-Arşiv üzerinde taslak olarak bulunan bir faturanın bilgilerini (ürünler, fiyatlar, kdv vb.) güncelleme.

```typescript
import EInvoice, {
  Invoice,
  BasicInvoice
} from 'e-fatura'

// EInvoice.getInvoice metodundan dönen fatura bilgileri
// ile birleştirilir.
const updatePayload: UpdateDraftInvoicePayload = {
  buyerFirstName: 'Alıcı adı',
  products: [
    {
      name: 'Ürün ismi'
    }, // Mevcut ürünün adını değiştirir.
    {
      nam: 'Ürün ismi 2'
    } // products[1] yoksa yeni ürün eklenir.
  ]
}

// Fatura veya faturaya ait UUID
const invoiceOrUuid: BasicInvoice | string = ''

const updatedInvoice: Invoice | null = await EInvoice.updateDraftInvoice(
  invoiceOrUuid,
  updatePayload
)

console.log(
  'Güncellenen fatura bilgileri:',
  updatedInvoice
)
```

Not: Fatura güncelleme için kullanabileceğiniz diğer alanlar için [types > UpdateDraftInvoicePayload](../src/types.ts) türüne bakabilirsiniz.
