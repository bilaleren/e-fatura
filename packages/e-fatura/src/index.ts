import EInvoiceApi from './EInvoiceApi';

export * from './types';
export * from './enums';
export * from './errors';

export { EInvoiceApi };
export { default as XsltRenderer } from './XsltRenderer';
export {
  getDateFormat,
  paymentPriceToText,
  isEInvoiceApiResponseError,
  mappingBasicInvoiceKeys,
  mappingBasicInvoiceIssuedToMeKeys,
  type EInvoiceApiResponseError
} from './utils';

export const EInvoice = EInvoiceApi.create();

export default EInvoice;
