import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import chalk from 'chalk';
import { zipSync, unzipSync } from 'fflate';
import { createCommand, createOption } from 'commander';
import {
  Print,
  EInvoiceApiClient,
  exitProgram,
  sleep,
  shortenText,
  isFileExists,
  launchBrowser,
  ensureDirectory,
  createInvoiceTasks,
  createInvoicesTable,
  createFilenameFromTmpl,
  commandWidthPdfOptions,
  commandWithDateOptions,
  commandWithStatusOption,
  commandWithEnvFileOption,
  type CommandWithDateOptions,
  type CommandWithPdfOptions,
  type CommandWithStatusOption,
  type CommandWithEnvFileOption
} from '../utils';
import { DOWNLOAD_PATH } from '../constants';
import type { BasicInvoice } from 'e-fatura';
import type * as puppeteer from 'puppeteer-core';

type InvoiceDownloadType = 'xml' | 'pdf' | 'html' | 'zip' | 'zip+pdf';

interface DownloadInvoicesOpts
  extends CommandWithDateOptions,
    CommandWithPdfOptions,
    CommandWithStatusOption,
    CommandWithEnvFileOption {
  readonly type: InvoiceDownloadType;
  readonly downloadPath: string;
  readonly filenameFormat: string;
  readonly interactive?: boolean;
}

const taskTitleWithFilename = (options: DownloadInvoicesOpts) => {
  return ({ invoice }: { invoice: BasicInvoice }) => {
    const filename = createFilenameFromTmpl(options.filenameFormat, {
      ext: options.type === 'zip+pdf' ? 'zip' : options.type,
      values: {
        invoice
      }
    });

    return `[${filename}] ${shortenText(invoice.titleOrFullName)} (${
      invoice.documentDate
    })`;
  };
};

const invoiceDownloadTypeMap: Record<InvoiceDownloadType, string> = {
  xml: 'XML',
  pdf: 'PDF',
  html: 'HTML',
  zip: 'ZIP',
  'zip+pdf': 'ZIP + PDF'
};

const actions = {
  async downloadInvoicesAsPdf(
    invoices: BasicInvoice[],
    options: DownloadInvoicesOpts
  ): Promise<void> {
    const {
      envFile,
      filenameFormat,
      downloadPath,
      pdfOptions,
      browserExecutablePath
    } = options;

    const pdfDownloadPath = path.resolve(downloadPath, 'pdf');

    await ensureDirectory(pdfDownloadPath, {
      recursive: true
    });

    const browser = await launchBrowser(browserExecutablePath);

    try {
      const context = await createInvoiceTasks(invoices, {
        task: async (invoice, task) => {
          const filename = createFilenameFromTmpl(filenameFormat, {
            ext: 'pdf',
            values: {
              invoice
            }
          });
          const filepath = path.join(pdfDownloadPath, filename);

          if (await isFileExists(filepath)) {
            return task.skip(`"${filename}" adlı dosya zaten var.`);
          }

          const invoiceHtml = await EInvoiceApiClient.exec(
            (client) => client.getInvoiceHtml(invoice),
            envFile,
            {
              isTTY: false,
              exitOnError: false
            }
          );
          const page = await browser.newPage();

          await page.setContent(invoiceHtml, {
            waitUntil: 'domcontentloaded'
          });

          const pdfBytes = await page.pdf({
            ...pdfOptions,
            path: undefined
          });

          await page.close();
          await fs.writeFile(filepath, pdfBytes);
          await sleep(100);
        },
        taskTitle: taskTitleWithFilename(options)
      });

      if (context.countOfCompleted > 0) {
        Print.success(
          context.countOfCompleted,
          'adet fatura şuraya kaydedildi:',
          chalk.bold.green(pdfDownloadPath)
        );
      }
    } catch {
      // no-empty
    } finally {
      await browser.close();
    }
  },

  async downloadInvoicesAsZip(
    invoices: BasicInvoice[],
    options: DownloadInvoicesOpts,
    includePdfFile?: boolean
  ): Promise<void> {
    const {
      envFile,
      filenameFormat,
      downloadPath,
      pdfOptions,
      browserExecutablePath
    } = options;

    const zipDownloadPath = path.resolve(downloadPath, 'zip');

    await ensureDirectory(zipDownloadPath, {
      recursive: true
    });

    let browser: puppeteer.Browser | undefined;

    if (includePdfFile) {
      browser = await launchBrowser(browserExecutablePath);
    }

    try {
      const context = await createInvoiceTasks(invoices, {
        task: async (invoice, task) => {
          const filename = createFilenameFromTmpl(filenameFormat, {
            ext: 'zip',
            values: {
              invoice
            }
          });
          const filepath = path.join(zipDownloadPath, filename);

          if (await isFileExists(filepath)) {
            return task.skip(`"${filename}" adlı dosya zaten var.`);
          }

          const zipBuffer = await EInvoiceApiClient.exec(
            (client) => client.getInvoiceZip(invoice),
            envFile,
            {
              isTTY: false,
              exitOnError: false
            }
          );

          if (browser && includePdfFile) {
            const page = await browser.newPage();
            const zipEntries = unzipSync(zipBuffer);
            const htmlFileBytes = zipEntries[`${invoice.uuid}_f.html`];
            const htmlFileContent =
              Buffer.from(htmlFileBytes).toString('utf-8');

            await page.setContent(htmlFileContent, {
              waitUntil: 'domcontentloaded'
            });

            const pdfBytes = await page.pdf({
              ...pdfOptions,
              path: undefined
            });

            await page.close();
            await fs.writeFile(
              filepath,
              zipSync({
                ...zipEntries,
                [`${invoice.uuid}_f.pdf`]: pdfBytes
              })
            );
          } else {
            await fs.writeFile(filepath, zipBuffer);
          }

          await sleep(100);
        },
        taskTitle: taskTitleWithFilename(options)
      });

      if (context.countOfCompleted > 0) {
        Print.success(
          context.countOfCompleted,
          'adet fatura şuraya kaydedildi:',
          chalk.bold.green(zipDownloadPath)
        );
      }
    } catch {
      // no-empty
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },

  async downloadInvoicesAsHtml(
    invoices: BasicInvoice[],
    options: DownloadInvoicesOpts
  ): Promise<void> {
    const { envFile, filenameFormat, downloadPath } = options;

    const htmlDownloadPath = path.resolve(downloadPath, 'html');

    await ensureDirectory(htmlDownloadPath, {
      recursive: true
    });

    const context = await createInvoiceTasks(invoices, {
      task: async (invoice, task) => {
        const filename = createFilenameFromTmpl(filenameFormat, {
          ext: 'html',
          values: {
            invoice
          }
        });
        const filepath = path.join(htmlDownloadPath, filename);

        if (await isFileExists(filepath)) {
          return task.skip(`"${filename}" adlı dosya zaten var.`);
        }

        const invoiceHtml = await EInvoiceApiClient.exec(
          (client) => client.getInvoiceHtml(invoice),
          envFile,
          {
            isTTY: false,
            exitOnError: false
          }
        );

        await fs.writeFile(filepath, invoiceHtml);
        await sleep(100);
      },
      taskTitle: taskTitleWithFilename(options)
    });

    if (context.countOfCompleted > 0) {
      Print.success(
        context.countOfCompleted,
        'adet fatura şuraya kaydedildi:',
        chalk.bold.green(htmlDownloadPath)
      );
    }
  },

  async downloadInvoicesAsXml(
    invoices: BasicInvoice[],
    options: DownloadInvoicesOpts
  ): Promise<void> {
    const { envFile, filenameFormat, downloadPath } = options;

    const xmlDownloadPath = path.resolve(downloadPath, 'xml');

    await ensureDirectory(xmlDownloadPath, {
      recursive: true
    });

    const context = await createInvoiceTasks(invoices, {
      task: async (invoice, task) => {
        const filename = createFilenameFromTmpl(filenameFormat, {
          ext: 'xml',
          values: {
            invoice
          }
        });
        const filepath = path.join(xmlDownloadPath, filename);

        if (await isFileExists(filepath)) {
          return task.skip(`"${filename}" adlı dosya zaten var.`);
        }

        const invoiceXml = await EInvoiceApiClient.exec(
          (client) => client.getInvoiceXml(invoice),
          envFile,
          {
            isTTY: false,
            exitOnError: false
          }
        );

        await fs.writeFile(filepath, invoiceXml);
        await sleep(100);
      },
      taskTitle: taskTitleWithFilename(options)
    });

    if (context.countOfCompleted > 0) {
      Print.success(
        context.countOfCompleted,
        'adet fatura şuraya kaydedildi:',
        chalk.bold.green(xmlDownloadPath)
      );
    }
  }
} as const;

const downloadInvoicesCommand = createCommand('download')
  .description('e-Arşiv üzerinde bulunan faturaları indir')
  .addOption(
    createOption('--type [type]', 'Faturaların hangi formatta indirileceği')
      .choices(Object.keys(invoiceDownloadTypeMap))
      .default('zip')
  );

commandWidthPdfOptions(downloadInvoicesCommand);
commandWithDateOptions(downloadInvoicesCommand);
commandWithStatusOption(downloadInvoicesCommand);
commandWithEnvFileOption(downloadInvoicesCommand);

downloadInvoicesCommand
  .option(
    '--download-path [path]',
    'Faturaların indirileceği dizin yolu',
    DOWNLOAD_PATH
  )
  .option(
    '--filename-format [format]',
    'İndirilecek faturanın dosya adı formatı',
    '{invoice.uuid}.{ext}'
  )
  .option(
    '-i, --interactive',
    'Belirli faturaları indirmek istiyorsanız bu seçeneği kullanın. Eğer seçenek aktifse faturaları seçmeniz için bir tablo arayüzü gösterilecektir'
  )
  .action(async function () {
    if (!process.stdout.isTTY) {
      return exitProgram();
    }

    const opts = this.opts<DownloadInvoicesOpts>();

    await EInvoiceApiClient.login(opts.envFile);

    const invoices = await EInvoiceApiClient.exec(
      (client) =>
        client.getBasicInvoices({
          startDate: opts.startDate,
          endDate: opts.endDate,
          approvalStatus: opts.status
        }),
      opts.envFile,
      {
        loadingText: 'Faturalar yükleniyor...'
      }
    );

    let selectedInvoices = invoices;

    if (opts.interactive) {
      selectedInvoices = await createInvoicesTable(invoices);
    } else {
      if (selectedInvoices.length === 0) {
        Print.warn('İndirilecek fatura bulunamadı.');
        return exitProgram();
      }
    }

    switch (opts.type) {
      case 'pdf':
        await actions.downloadInvoicesAsPdf(selectedInvoices, opts);
        break;
      case 'xml':
        await actions.downloadInvoicesAsXml(selectedInvoices, opts);
        break;
      case 'html':
        await actions.downloadInvoicesAsHtml(selectedInvoices, opts);
        break;
      case 'zip':
      case 'zip+pdf':
        await actions.downloadInvoicesAsZip(
          selectedInvoices,
          opts,
          opts.type === 'zip+pdf'
        );
        break;
    }
  });

export default downloadInvoicesCommand;
