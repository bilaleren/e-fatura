### Kullanıcı (Şirket) Bilgilerini Çekme

e-Arşiv üzerinde kayıtlı olan kullanıcı (şirket) bilgilerini alma.

```typescript
import EInvoice, { UserInformation } from 'e-fatura'

const userInformation: UserInformation = await EInvoice.getUserInformation()

console.log('Kullanıcı (şirket) bilgileri:', userInformation)
```
