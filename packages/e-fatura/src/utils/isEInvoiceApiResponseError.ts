import isPlainObject from './isPlainObject';

export interface EInvoiceApiResponseError {
  error: '1';
  messages: {
    text: string;
    type: string;
  }[];
}

function isEInvoiceApiResponseError(
  value: unknown
): value is EInvoiceApiResponseError {
  return (
    isPlainObject(value) && value.error === '1' && Array.isArray(value.messages)
  );
}

export default isEInvoiceApiResponseError;
