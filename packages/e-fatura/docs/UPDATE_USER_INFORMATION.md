### Kullanıcı (Şirket) Bilgilerini Güncelleme

e-Arşiv üzerinde kayıtlı olan kullanıcı (şirket) bilgilerini güncelleme.

```typescript
import EInvoice, {
  UserInformation,
  UpdateUserInformationPayload
} from 'e-fatura'

const updatePayload: UpdateUserInformationPayload = {
  firstName: 'Ad'
}

const newUserInformation: UserInformation | null = await EInvoice.updateUserInformation(
  updatePayload
)

console.log('Yeni kullanıcı (şirket) bilgileri:', newUserInformation)
```
