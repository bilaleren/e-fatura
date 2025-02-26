### Fatura Oluşturma

e-Arşiv üzerinde taslak fatura oluşturur.

```typescript
import EInvoice, {
  InvoiceType,
  EInvoiceCountry,
  EInvoiceUnitType,
  EInvoiceCurrencyType,
  CreateDraftInvoicePayload
} from 'e-fatura'

const payload: CreateDraftInvoicePayload = {
  buyerFirstName: 'Bilal',
  buyerLastName: 'Eren',
  base: 10,
  paymentPrice: 10,
  invoiceType: InvoiceType.SATIS,
  country: EInvoiceCountry.TURKIYE,
  currency: EInvoiceCurrencyType.TURK_LIRASI,
  productsTotalPrice: 10,
  includedTaxesTotalPrice: 10,
  products: [
    {
      name: 'Ürün',
      quantity: 10,
      unitPrice: 1,
      price: 10,
      unitType: EInvoiceUnitType.ADET,
      totalAmount: 10
    }
  ]
}

const result: string = await EInvoice.createDraftInvoice(
  payload
)

console.log(
  "Oluşturulan faturanın UUID'i:",
  result
)
```

Not: Fatura oluşturmak için kullanabileceğiniz diğer alanlar için [CreateDraftInvoicePayload](../src/types.ts#L689) türüne bakabilirsiniz.
