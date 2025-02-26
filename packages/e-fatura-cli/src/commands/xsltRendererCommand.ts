import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import chalk from 'chalk';
import { createCommand } from 'commander';
import { zipSync, type Zippable } from 'fflate';
import {
  Print,
  EInvoiceApiClient,
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
  type CommandWithPdfOptions,
  type CommandWithDateOptions,
  type CommandWithStatusOption,
  type CommandWithEnvFileOption
} from '../utils';
import { XSLT_OUTPUT_PATH } from '../constants';
import type { BasicInvoice } from 'e-fatura';
import type * as puppeteer from 'puppeteer-core';

interface XsltRendererOpts
  extends CommandWithDateOptions,
    CommandWithPdfOptions,
    CommandWithStatusOption,
    CommandWithEnvFileOption {
  readonly outputPath: string;
  readonly filenameFormat: string;
  readonly xsltprocExecutablePath?: string;
  readonly includePdf?: boolean;
}

const taskTitleWithFilename = (options: XsltRendererOpts) => {
  return ({ invoice }: { invoice: BasicInvoice }) => {
    const filename = createFilenameFromTmpl(options.filenameFormat, {
      ext: 'zip',
      values: {
        invoice
      }
    });

    return `[${filename}] ${shortenText(invoice.titleOrFullName)} (${
      invoice.documentDate
    })`;
  };
};

const xsltRendererCommand = createCommand('xslt-renderer').description(
  'e-Arşiv üzerinde bulunan faturaları xslt ile işle'
);

commandWidthPdfOptions(xsltRendererCommand);
commandWithDateOptions(xsltRendererCommand);
commandWithStatusOption(xsltRendererCommand);
commandWithEnvFileOption(xsltRendererCommand);

xsltRendererCommand
  .option(
    '--output-path [path]',
    'İşlenen faturaların kaydedileceği dizin yolu',
    XSLT_OUTPUT_PATH
  )
  .option(
    '--filename-format [format]',
    'Fatura çıktısının dosya adı formatı',
    '{invoice.uuid}.zip'
  )
  .option(
    '--include-pdf',
    'Aktifse fatura çıktısına PDF dosyası da dahil edilir'
  )
  .option(
    '--xsltproc-executable-path [path]',
    'xsltproc komut satırı uygulamasının çalıştırılabilir dosya yolu',
    '/usr/bin/xsltproc'
  )
  .arguments('<xslt-path>')
  .action(async function (xsltPath: string) {
    if (!process.stdout.isTTY) {
      process.exit();
    }

    const opts = this.opts<XsltRendererOpts>();
    const xsltFilepath = path.resolve(xsltPath);

    if (!(await isFileExists(xsltFilepath))) {
      Print.error(
        'Sağladığınız xslt dosyası bulunamadı. Dosya yolunu kontrol ederek tekrar deneyin.'
      );
      process.exit(1);
    }

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

    const selectedInvoices = await createInvoicesTable(invoices);

    const xsltOutputPath = path.resolve(opts.outputPath);

    let browser: puppeteer.Browser | undefined;

    await ensureDirectory(xsltOutputPath, {
      recursive: true
    });

    if (opts.includePdf) {
      browser = await launchBrowser(opts.browserExecutablePath);
    }

    try {
      const context = await createInvoiceTasks(selectedInvoices, {
        async task(invoice, task) {
          const zipFilename = createFilenameFromTmpl(opts.filenameFormat, {
            ext: 'zip',
            values: {
              invoice
            }
          });

          const zipFilepath = path.join(xsltOutputPath, zipFilename);

          if (await isFileExists(zipFilepath)) {
            return task.skip(`"${zipFilename}" adlı dosya zaten var.`);
          }

          const xsltRenderer = await EInvoiceApiClient.exec(
            (client) =>
              Promise.resolve(
                client.invoiceXsltRenderer(invoice, xsltFilepath, {
                  xsltprocOptions: {
                    xsltprocExecutablePath: opts.xsltprocExecutablePath
                  }
                })
              ),
            opts.envFile
          );

          const xmlResult = await xsltRenderer.toXml();
          const htmlResult = await xsltRenderer.toHtml();
          const zipEntries: Zippable = {
            [`${invoice.uuid}.xml`]: xmlResult,
            [`${invoice.uuid}.html`]: htmlResult
          };

          if (browser && opts.includePdf) {
            const page = await browser.newPage();

            await page.setContent(htmlResult.toString('utf-8'), {
              waitUntil: 'domcontentloaded'
            });

            zipEntries[`${invoice.uuid}.pdf`] = await page.pdf({
              ...opts.pdfOptions,
              path: undefined
            });

            await page.close();
          }

          await fs.writeFile(zipFilepath, zipSync(zipEntries));
        },
        taskTitle: taskTitleWithFilename(opts)
      });

      if (context.countOfCompleted > 0) {
        Print.success(
          context.countOfCompleted,
          'adet fatura şuraya kaydedildi:',
          chalk.bold.green(xsltOutputPath)
        );
      }
    } catch (_) {
      // no-empty
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

export default xsltRendererCommand;
