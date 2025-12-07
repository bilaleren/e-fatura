import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { EInvoiceApi } from 'e-fatura';
import chalk from 'chalk';
import Print from './Print';
import exitProgram from './exitProgram';
import isFileExists from './isFileExists';
import tryPromise, { type TryPromiseOptions } from './tryPromise';
import {
  USERNAME_ENV_KEY,
  PASSWORD_ENV_KEY,
  E_INVOICE_SESSION_FILE_PATH
} from '../constants';

interface Credentials {
  readonly username: string;
  readonly password: string;
}

abstract class EInvoiceApiClient {
  private static client: EInvoiceApi | null = null;

  private static credentials: Credentials | null = null;

  static async exec<T>(
    factory: (client: EInvoiceApi) => Promise<T>,
    envFile: string | undefined,
    options?: TryPromiseOptions
  ) {
    const client = this.client;

    if (!client) {
      Print.error('e-Arşiv istemcisi tanımlanmamış.');
      return exitProgram(1);
    }

    return tryPromise(() => factory(client), {
      onSessionTimeout: async () => {
        await this.login(envFile, false);
      },
      ...options
    });
  }

  static async login(
    envFile: string | undefined,
    isTTY?: boolean
  ): Promise<EInvoiceApi> {
    await this.logout();

    const credentials = await this.getCredentials(envFile);

    this.client = await tryPromise(
      async () => {
        await this.cleanupSession(credentials);

        const client = EInvoiceApi.create();

        client.setTestMode(credentials.password === '1');
        client.setCredentials(credentials);

        await client.initAccessToken();

        await this.createSessionFile(client.getToken()!);

        return client;
      },
      {
        isTTY,
        loadingText: 'Giriş yapılıyor...'
      }
    );

    return this.client;
  }

  static async logout(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      this.client.logout();
      await this.removeSessionFile();
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      this.client = null;
    }
  }

  static async getCredentials(
    envFile: string | undefined
  ): Promise<Credentials> {
    if (this.credentials) {
      return this.credentials;
    }

    if (envFile && (await isFileExists(envFile))) {
      dotenv.config({
        path: envFile,
        override: true
      });
    }

    const username = process.env[USERNAME_ENV_KEY];
    const password = process.env[PASSWORD_ENV_KEY];

    if (!username || !password) {
      Print.error(
        `${chalk.cyan(`$${USERNAME_ENV_KEY}`)} ve/veya ${chalk.cyan(
          `$${PASSWORD_ENV_KEY}`
        )} adlı ortam değişken(ler)i sağlanmadı.`
      );

      return exitProgram(1);
    }

    this.credentials = {
      username,
      password
    };

    return this.credentials;
  }

  private static async createSessionFile(token: string): Promise<void> {
    await fs.writeFile(E_INVOICE_SESSION_FILE_PATH, token, 'utf-8');
  }

  private static async removeSessionFile(): Promise<void> {
    if (await this.isSessionFileExists()) {
      await fs.rm(E_INVOICE_SESSION_FILE_PATH);
    }
  }

  private static async cleanupSession(credentials: Credentials): Promise<void> {
    if (!(await this.isSessionFileExists())) {
      return;
    }

    try {
      const token = await fs.readFile(E_INVOICE_SESSION_FILE_PATH, 'utf-8');
      const client = EInvoiceApi.create();

      client.setTestMode(credentials.password === '1');

      client.setToken(token);

      await client.logout();
    } finally {
      await this.removeSessionFile();
    }
  }

  private static isSessionFileExists(): Promise<boolean> {
    return isFileExists(E_INVOICE_SESSION_FILE_PATH);
  }
}

export default EInvoiceApiClient;
