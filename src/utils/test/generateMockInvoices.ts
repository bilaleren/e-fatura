import uuidV1 from '../uuidV1'
import generateMockBasicInvoice from './generateMockBasicInvoice'
import { InvoiceApprovalStatus } from '../../enums'

function generateMockInvoices(): Record<string, unknown>[] {
  return [
    generateMockBasicInvoice({
      uuid: uuidV1(),
      custom: {
        onayDurumu: InvoiceApprovalStatus.UNAPPROVED,
        aliciUnvanAdSoyad: 'Test Alıcı 1'
      },
      mappingWithTurkishKeys: true
    }),
    generateMockBasicInvoice({
      uuid: uuidV1(),
      custom: {
        onayDurumu: InvoiceApprovalStatus.DELETED,
        aliciUnvanAdSoyad: 'Test Alıcı 2'
      },
      mappingWithTurkishKeys: true
    }),
    generateMockBasicInvoice({
      uuid: uuidV1(),
      custom: {
        onayDurumu: InvoiceApprovalStatus.APPROVED,
        aliciUnvanAdSoyad: 'Test Alıcı 3'
      },
      mappingWithTurkishKeys: true
    })
  ]
}

export default generateMockInvoices
