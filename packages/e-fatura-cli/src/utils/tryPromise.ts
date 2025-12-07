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
import exitProgram from './exitProgram';

export interface TryPromiseOptions {
  isTTY?: boolean;
  exitOnError?: boolean;
  loadingText?: string;
  onSessionTimeout?: () => Promise<void>;
  maxSessionRetryCount?: number;
  currentSessionRetryCount?: number;
}

async function tryPromise<T>(
  factory: () => Promise<T>,
  options?: TryPromiseOptions
): Promise<T> {
  const {
    isTTY = process.stdout.isTTY,
    exitOnError = true,
    loadingText,
    onSessionTimeout,
    maxSessionRetryCount = 3,
    currentSessionRetryCount = 0
  } = options || {};

  let load: Ora | undefined;

  if (isTTY && loadingText && currentSessionRetryCount === 0) {
    load = ora(loadingText).start();
  }

  const stopLoad = (): void => {
    if (load) {
      load.stop();
      process.stdout.write(ansiEscapes.cursorShow);
      load = undefined;
    }
  };

  const printError = (...args: any[]): void => {
    if (isTTY) {
      Print.error(...args);
    }
  };

  const handleSessionTimeoutRetry = async (): Promise<T> => {
    stopLoad();

    try {
      await onSessionTimeout?.();
    } catch (error) {
      printError(error);
    }

    return tryPromise(factory, {
      ...options,
      currentSessionRetryCount: currentSessionRetryCount + 1
    });
  };

  try {
    const result = await factory();

    stopLoad();

    return result;
  } catch (err) {
    stopLoad();

    if (axios.isAxiosError(err)) {
      const error = err as AxiosError;
      const data = error.response?.data;

      if (onSessionTimeout && isEInvoiceApiResponseError(data)) {
        const isSessionTimeoutError = data.messages.some(
          (message) => message.type === '4'
        );

        if (
          currentSessionRetryCount < maxSessionRetryCount &&
          isSessionTimeoutError
        ) {
          return handleSessionTimeoutRetry();
        }
      }

      printError(`${error.name}:`, error.message);
    } else if (err instanceof EInvoiceApiError) {
      if (
        onSessionTimeout &&
        currentSessionRetryCount < maxSessionRetryCount &&
        err.errorCode === EInvoiceApiErrorCode.SESSION_TIMEOUT
      ) {
        return handleSessionTimeoutRetry();
      } else {
        const error = err as EInvoiceApiError;
        const response = error.response;

        if (isEInvoiceApiResponseError(response?.data)) {
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
      return exitProgram(1);
    } else {
      throw err;
    }
  }
}

export default tryPromise;
