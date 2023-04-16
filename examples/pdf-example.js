const path = require('path')
const fs = require('fs/promises')
const { default: EInvoice } = require('e-fatura')

async function bootstrap() {
  EInvoice.setTestMode(true)

  await EInvoice.setAnonymousCredentials()

  await EInvoice.connect()

  const invoiceUuid = await EInvoice.createDraftInvoice({
    buyerFirstName: 'Test',
    buyerLastName: 'Alıcı',
    base: 10,
    paymentPrice: 10,
    productsTotalPrice: 10,
    includedTaxesTotalPrice: 10,
    products: [
      {
        name: 'Test Ürün',
        quantity: 10,
        unitPrice: 1,
        price: 10,
        totalAmount: 10
      }
    ]
  })

  const pdfBuffer = await EInvoice.getInvoicePDF(invoiceUuid)
  const invoicePath = path.join(
    __dirname,
    '..',
    'invoice-data',
    `Fatura-${new Date().toISOString()}.pdf`
  )

  await fs.writeFile(invoicePath, pdfBuffer)

  console.log('Fatura PDF kaydedildi:', invoicePath)

  await EInvoice.logout()
}

bootstrap()
