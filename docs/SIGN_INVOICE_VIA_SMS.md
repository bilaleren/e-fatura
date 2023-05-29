### SMS ile Fatura Doğrulama ve Onaylama

e-Arşiv üzerinden belirli bir faturayı imzalama.

```typescript
import EInvoice, {
  BasicInvoice,
  EInvoiceApiError,
  EInvoiceTypeError,
  EInvoiceApiErrorCode
} from 'e-fatura'

// İmzalanacak faturanın içeriği.
const invoiceToBeSigned: BasicInvoice = {}

try {
  // e-Arşiv üzerinde kayıtlı olan telefon numarasına
  // doğrulama kodu gönderir ve işlem kimliğini geri döner.
  const operationId: string = await EInvoice.sendSMSCode()

  await EInvoice.verifySMSCode(
    '', // SMS ile gönderilen doğrulama kodu.
    operationId,
    invoiceToBeSigned
  )

  console.log('Fatura başarılı bir şekilde imzalandı.')
} catch (e) {
  if (e instanceof EInvoiceApiError) {
    const response = e.getResponse()

    switch (response.errorCode) {
      case EInvoiceApiErrorCode.SERVER_ERROR:
        console.error('Sunucu hatası.')
        break
      case EInvoiceApiErrorCode.INVALID_RESPONSE:
        console.error('Geçersiz sunucu cevabı.')
        break
      case EInvoiceApiErrorCode.NOT_VERIFIED_SMS_CODE:
        console.error('SMS doğrulama kodu onaylanamadı.')
        break
      case EInvoiceApiErrorCode.INVALID_SMS_OPERATION_ID:
        console.error('SMS gönderilemedi veya işlem kimliği geçersiz.')
        break
      case EInvoiceApiErrorCode.SAVED_PHONE_NUMBER_NOT_FOUND:
        console.error('Kayıtlı telefon numarası bulunamadı.')
        break
    }
  } else if (e instanceof EInvoiceTypeError) {
    console.error('Tür hatası meydana geldi:', e)
  } else {
    console.error('Bilinmeyen bir hata meydana geldi:', e)
  }
}
```
