import deepMerge from 'lodash.merge'
import getDateFormat from '../getDateFormat'
import InvoiceApprovalStatus from '../../enums/InvoiceApprovalStatus'

interface GenerateMockBasicInvoiceOptions {
  uuid: string
  date?: Date
  custom?: Record<string, unknown>
  mappingWithTurkishKeys?: boolean
}

function generateMockBasicInvoice(
  options: GenerateMockBasicInvoiceOptions
): Record<string, any> {
  const { date, uuid, custom = {}, mappingWithTurkishKeys = false } = options

  if (mappingWithTurkishKeys) {
    return deepMerge(
      {
        ettn: uuid,
        belgeNumarasi: uuid,
        aliciVknTckn: '1'.repeat(11),
        aliciUnvanAdSoyad: 'buyerTitleOrFullName',
        belgeTarihi: getDateFormat(date),
        belgeTuru: 'FATURA',
        onayDurumu: InvoiceApprovalStatus.UNAPPROVED
      },
      custom
    )
  }

  return deepMerge(
    {
      uuid,
      documentNumber: uuid,
      taxOrIdentityNumber: '1'.repeat(11),
      buyerTitleOrFullName: 'buyerTitleOrFullName',
      documentDate: getDateFormat(date),
      documentType: 'FATURA',
      approvalStatus: InvoiceApprovalStatus.UNAPPROVED
    },
    custom
  )
}

export default generateMockBasicInvoice
