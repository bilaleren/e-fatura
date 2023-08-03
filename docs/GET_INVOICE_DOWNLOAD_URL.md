### Faturanın İndirme Bağlantısını Alma

Faturanın indirme bağlantısını verir. .zip uzantılı bir dosya indirilir.

```typescript
import EInvoice, { BasicInvoice, InvoiceOrUuid } from 'e-fatura'

// Fatura veya faturaya ait UUID
const invoiceOrUuid: InvoiceOrUuid = ''

const downloadUrl: string = await EInvoice.getInvoiceDownloadUrl(
  invoiceOrUuid,
  false, // Faturanın onay durumu: varsayılan true
)

console.log('Fatura indirme bağlantısı:', downloadUrl)
```

Not: İndirme bağlantısı oluşturulduktan sonra **EInvoice.logout()** metodunun kullanılmaması gerekmektedir. İndirme bağlantısına gittiğinizde **Oturum zamanaşımına uğradı, yeni oturum açınız** içerikli bir hata verecektir. Fatura indirme ile ilgili daha fazla bilgi için [download-zip-example.js](../examples/download-zip-example.js) dosyasına bakabilirsiniz.

