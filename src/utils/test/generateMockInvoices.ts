import { v1 as uuidV1 } from 'uuid'
import generateMockBasicInvoice from './generateMockBasicInvoice'
import InvoiceApprovalStatus from '../../enums/InvoiceApprovalStatus'

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
