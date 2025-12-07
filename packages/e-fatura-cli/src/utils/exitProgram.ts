import Print from './Print';
import EInvoiceApiClient from './EInvoiceApiClient';

async function exitProgram(code: number = 0): Promise<never> {
  try {
    await EInvoiceApiClient.logout();
  } catch (error) {
    code = 1;
    Print.error(error);
  } finally {
    process.exit(code);
  }
}

export default exitProgram;
