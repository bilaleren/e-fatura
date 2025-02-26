import axios, { type AxiosError } from 'axios';
import Print from './Print';
import ora, { type Ora } from 'ora';
import ansiEscapes from 'ansi-escapes';
import {
  EInvoiceError,
  EInvoiceApiError,
  EInvoiceApiErrorCode,
  isEInvoiceApiResponseError
} from 'e-fatura';

let retryCount = 0;

export interface TryPromiseOptions<T> {
  isTTY?: boolean;
  exitOnError?: boolean;
  loadingText?: string;
  maxRetryCount?: number;
  whenSessionTimeout?: () => Promise<T>;
}

async function tryPromise<T>(
  factory: () => Promise<T>,
  options?: TryPromiseOptions<T>
): Promise<T> {
  const {
    isTTY = process.stdout.isTTY,
    exitOnError = true,
    loadingText,
    maxRetryCount = 3,
    whenSessionTimeout
  } = options || {};

  let load: Ora | undefined;

  if (isTTY && loadingText) {
    load = ora(loadingText).start();
  }

  const printError = (...args: any[]) => {
    if (isTTY) {
      Print.error(...args);
    }
  };

  try {
    const result = await factory();

    if (load) {
      load.stop();
      process.stdout.write(ansiEscapes.cursorShow);
    }

    retryCount = 0;

    return result;
  } catch (err) {
    if (load) {
      load.stop();
      process.stdout.write(ansiEscapes.cursorShow);
    }

    if (axios.isAxiosError(err)) {
      const error = err as AxiosError;
      const data = error.response?.data;

      if (whenSessionTimeout && isEInvoiceApiResponseError(data)) {
        const isSessionTimeoutError = data.messages.some(
          (message) => message.type === '4'
        );

        if (retryCount <= maxRetryCount && isSessionTimeoutError) {
          return whenSessionTimeout();
        }
      }

      printError(`${error.name}:`, error.message);
    } else if (err instanceof EInvoiceApiError) {
      if (
        whenSessionTimeout &&
        retryCount <= maxRetryCount &&
        err.errorCode === EInvoiceApiErrorCode.SESSION_TIMEOUT
      ) {
        return whenSessionTimeout();
      } else {
        const error = err as EInvoiceApiError;
        const response = error.response;

        if (isEInvoiceApiResponseError(response.data)) {
          const messages = response.data.messages.map(
            (message) => `[${message.type}] ${message.text}`
          );

          printError(`${error.name}:`, ...messages);
        } else {
          printError(`${error.name}:`, err.message);
        }
      }
    } else if (err instanceof EInvoiceError) {
      const error = err as EInvoiceApiError;
      printError(`${error.name}:`, error.message);
    } else {
      printError(err);
    }

    if (exitOnError) {
      process.exit(1);
    } else {
      throw err;
    }
  }
}

export default tryPromise;
