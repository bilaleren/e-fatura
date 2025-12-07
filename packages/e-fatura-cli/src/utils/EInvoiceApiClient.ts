import * as dotenv from 'dotenv';
import { EInvoiceApi } from 'e-fatura';
import chalk from 'chalk';
import Print from './Print';
import isFileExists from './isFileExists';
import tryPromise, { type TryPromiseOptions } from './tryPromise';
import { USERNAME_ENV_KEY, PASSWORD_ENV_KEY } from '../constants';

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
      process.exit(1);
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
        const client = EInvoiceApi.create();

        client.setTestMode(credentials.password === '1');
        client.setCredentials(credentials);

        await client.initAccessToken();

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
    if (this.client) {
      await tryPromise(() => this.client!.logout());
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

      process.exit(1);
    }

    this.credentials = {
      username,
      password
    };

    return this.credentials;
  }
}

export default EInvoiceApiClient;
