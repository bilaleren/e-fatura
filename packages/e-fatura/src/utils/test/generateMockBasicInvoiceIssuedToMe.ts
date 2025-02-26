import deepMerge from '../deepMerge';
import getDateFormat from '../getDateFormat';
import { InvoiceApprovalStatus } from '../../enums';

interface GenerateMockBasicInvoiceIssuedToMeOptions {
  uuid: string;
  date?: Date;
  custom?: Record<string, unknown>;
  mappingWithTurkishKeys?: boolean;
}

function generateMockBasicInvoiceIssuedToMe(
  options: GenerateMockBasicInvoiceIssuedToMeOptions
): Record<string, any> {
  const { date, uuid, custom = {}, mappingWithTurkishKeys = false } = options;

  if (mappingWithTurkishKeys) {
    return deepMerge(
      {
        ettn: uuid,
        belgeNumarasi: uuid,
        saticiVknTckn: '1'.repeat(11),
        saticiUnvanAdSoyad: 'titleOrFullName',
        belgeTarihi: getDateFormat(date),
        belgeTuru: 'FATURA',
        onayDurumu: InvoiceApprovalStatus.UNAPPROVED
      },
      custom
    );
  }

  return deepMerge(
    {
      uuid,
      documentNumber: uuid,
      taxOrIdentityNumber: '1'.repeat(11),
      titleOrFullName: 'titleOrFullName',
      documentDate: getDateFormat(date),
      documentType: 'FATURA',
      approvalStatus: InvoiceApprovalStatus.UNAPPROVED
    },
    custom
  );
}

export default generateMockBasicInvoiceIssuedToMe;
