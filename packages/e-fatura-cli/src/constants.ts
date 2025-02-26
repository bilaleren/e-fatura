import * as os from 'os';
import * as path from 'path';

export const E_INVOICE_PATH = path.resolve(os.homedir(), 'e-fatura');
export const DOWNLOAD_PATH = path.join(E_INVOICE_PATH, 'downloads');
export const OUTPUTS_PATH = path.join(E_INVOICE_PATH, 'outputs');
export const XSLT_OUTPUT_PATH = path.join(OUTPUTS_PATH, 'xslt');
export const USERNAME_ENV_KEY = 'E_ARCHIVE_USERNAME';
export const PASSWORD_ENV_KEY = 'E_ARCHIVE_PASSWORD';
export const E_ARCHIVE_VERIFICATION_CODE_LENGTH = 6;
