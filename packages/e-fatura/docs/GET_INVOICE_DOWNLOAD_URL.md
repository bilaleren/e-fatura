### Faturanın İndirme Bağlantısını Alma

Faturanın indirme bağlantısını verir. .zip uzantılı bir dosya indirilir.

```typescript
import EInvoice, { BasicInvoice, InvoiceOrUuid } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const downloadUrl = await EInvoice.getInvoiceDownloadUrl(
  invoiceOrUuid,
  false, // Faturanın onay durumu: varsayılan true
)

console.log('Fatura indirme bağlantısı:', downloadUrl)
```

**Uyarı!** İndirme bağlantısı oluşturulduktan sonra **EInvoice.logout()** metodunun kullanılmaması gerekmektedir. İndirme bağlantısına gittiğinizde **Oturum zaman aşımına uğradı, yeni oturum açınız** içerikli bir hata verecektir.

