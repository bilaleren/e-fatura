const axios = require('axios')
const fs = require('fs/promises')
const path = require('path')
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

  const downloadUrl = EInvoice.getInvoiceDownloadUrl(invoiceUuid)
  const response = await axios.get(downloadUrl, {
    responseType: 'stream'
  })

  /**
   * @type {Buffer[]}
   */
  const chunks = []

  /**
   * @type {import('fs').ReadStream}
   */
  const readStream = response.data
  const invoiceZipPath = path.resolve(
    __dirname,
    '..',
    'invoice-data',
    `Fatura-${new Date().toISOString()}.zip`
  )

  readStream.on('data', (data) => {
    chunks.push(Buffer.from(data))
  })

  readStream.on('end', async () => {
    try {
      // Bu kontrol yapılmazsa bozuk bir zip dosyası oluşturulabilir.
      const json = JSON.parse(Buffer.concat(chunks).toString('utf8'))

      if (json) {
        console.error('Download PDF error:', json)
      }
    } catch (e) {
      await fs.writeFile(invoiceZipPath, Buffer.concat(chunks))

      console.log('Invoice zip file created:', invoiceZipPath)
    } finally {
      await EInvoice.logout()
    }
  })
}

bootstrap()
