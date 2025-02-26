import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import chalk from 'chalk';
import { createCommand, createOption } from 'commander';
import writeXlsxFile from 'write-excel-file/node';
import { stringify as csvStringifySync } from 'csv-stringify/sync';
import {
  EInvoiceApiClient,
  Print,
  objectMap,
  capitalize,
  isFileExists,
  ensureDirectory,
  createInvoicesTable,
  createFilenameFromTmpl,
  commandWithDateOptions,
  commandWithStatusOption,
  commandWithEnvFileOption,
  commandWithHourlySearchIntervalOption,
  basicInvoiceKeyMap,
  type CommandWithDateOptions,
  type CommandWithStatusOption,
  type CommandWithEnvFileOption,
  type CommandWithHourlySearchIntervalOption
} from '../utils';
import { OUTPUTS_PATH } from '../constants';
import type { BasicInvoice } from 'e-fatura';
import type { Schema as ExcelSchema } from 'write-excel-file';

type InvoiceExportType = 'csv' | 'json' | 'excel';

interface ExportInvoicesOpts
  extends CommandWithDateOptions,
    CommandWithStatusOption,
    CommandWithEnvFileOption,
    CommandWithHourlySearchIntervalOption {
  readonly type: InvoiceExportType;
  readonly outputPath: string;
  readonly filenameFormat: string;
  readonly interactive?: boolean;
}

const invoiceExportTypeMap: Record<InvoiceExportType, true> = {
  csv: true,
  json: true,
  excel: true
};

const invoiceExtensionMap: Record<InvoiceExportType, 'csv' | 'json' | 'xlsx'> =
  {
    csv: 'csv',
    json: 'json',
    excel: 'xlsx'
  };

const normalizeDateOptions = <T extends CommandWithDateOptions>(
  options: T
): T => ({
  ...options,
  startDate: options.startDate.replace(/\//g, '-'),
  endDate: options.endDate.replace(/\//g, '-')
});

const actions = {
  async writeToFile(
    data: () => Promise<string | Buffer>,
    options: ExportInvoicesOpts
  ): Promise<void> {
    const { type, outputPath, filenameFormat } = options;

    if (process.stdout.isTTY) {
      const filename = createFilenameFromTmpl(filenameFormat, {
        ext: invoiceExtensionMap[type],
        values: {
          this: normalizeDateOptions(options)
        }
      });
      const outputDir = path.join(path.resolve(outputPath), type);
      const filepath = path.join(outputDir, filename);

      await ensureDirectory(outputDir, {
        recursive: true
      });

      if (await isFileExists(filepath)) {
        Print.warn(`"${filepath}" adlı dosya zaten var.`);
        process.exit();
      }

      const fileData = await data();

      await fs.writeFile(
        filepath,
        fileData,
        typeof fileData === 'string' ? 'utf-8' : undefined
      );

      Print.success(
        capitalize(type),
        'dosyası şuraya kaydedildi:',
        chalk.bold.green(filepath)
      );
    } else {
      process.stdout.write(await data());
    }
  },

  async invoicesExportToCsv(
    invoices: BasicInvoice[],
    options: ExportInvoicesOpts
  ): Promise<void> {
    await actions.writeToFile(
      () =>
        Promise.resolve(
          csvStringifySync(invoices, {
            header: true,
            encoding: 'utf-8',
            columns: objectMap(basicInvoiceKeyMap, (key, header) => ({
              key,
              header
            }))
          })
        ),
      options
    );
  },

  async invoicesExportToJson(
    invoices: BasicInvoice[],
    options: ExportInvoicesOpts
  ): Promise<void> {
    await actions.writeToFile(
      () => Promise.resolve(JSON.stringify(invoices)),
      options
    );
  },

  async invoicesExportToExcel(
    invoices: BasicInvoice[],
    options: ExportInvoicesOpts
  ): Promise<void> {
    const schema: ExcelSchema<BasicInvoice> = [
      {
        column: basicInvoiceKeyMap.uuid,
        value: (object) => object.uuid,
        width: 15
      },
      {
        column: basicInvoiceKeyMap.titleOrFullName,
        value: (object) => object.titleOrFullName,
        width: 20
      },
      {
        column: basicInvoiceKeyMap.documentDate,
        value: (object) => object.documentDate,
        width: 18,
        align: 'center'
      },
      {
        column: basicInvoiceKeyMap.taxOrIdentityNumber,
        value: (object) => object.taxOrIdentityNumber,
        width: 12,
        align: 'center'
      },
      {
        column: basicInvoiceKeyMap.documentType,
        value: (object) => object.documentType,
        width: 12,
        align: 'center'
      },
      {
        column: basicInvoiceKeyMap.documentNumber,
        value: (object) => object.documentNumber,
        width: 18,
        align: 'center'
      },
      {
        column: basicInvoiceKeyMap.approvalStatus,
        value: (object) => object.approvalStatus,
        width: 12,
        align: 'center'
      }
    ];

    await actions.writeToFile(
      () =>
        writeXlsxFile(invoices, {
          schema,
          buffer: true,
          getHeaderStyle: (columnSchema) => ({
            align: 'center',
            fontFamily: columnSchema.fontFamily,
            fontWeight: 'bold'
          })
        }),
      options
    );
  }
} as const;

const exportInvoicesCommand = createCommand('export')
  .description('e-Arşiv üzerinde bulunan temel fatura bilgilerini dışa aktar')
  .addOption(
    createOption(
      '--type [type]',
      'Faturaların hangi formatta dışarı aktarılacağı'
    )
      .default('json')
      .choices(Object.keys(invoiceExportTypeMap))
  );

commandWithDateOptions(exportInvoicesCommand);
commandWithStatusOption(exportInvoicesCommand);
commandWithEnvFileOption(exportInvoicesCommand);
commandWithHourlySearchIntervalOption(exportInvoicesCommand);

exportInvoicesCommand
  .option(
    '--output-path [path]',
    'Çıktıların kaydedileceği dizin yolu',
    OUTPUTS_PATH
  )
  .option(
    '--filename-format [format]',
    'Çıktının dosya adı formatı',
    '{this.startDate}-{this.endDate}.{ext}'
  )
  .option(
    '-i, --interactive',
    'Belirli faturaları dışa aktarmak istiyorsanız bu seçeneği kullanın. Eğer seçenek aktifse faturaları seçmeniz için bir tablo arayüzü gösterilecektir'
  )
  .action(async function () {
    const opts = this.opts<ExportInvoicesOpts>();

    if (opts.interactive && !process.stdout.isTTY) {
      process.exit();
    }

    await EInvoiceApiClient.login(opts.envFile);

    const invoices = await EInvoiceApiClient.exec(
      (client) =>
        !opts.issuedToMe
          ? client.getBasicInvoices({
              startDate: opts.startDate,
              endDate: opts.endDate,
              approvalStatus: opts.status
            })
          : client.getBasicInvoicesIssuedToMe({
              startDate: opts.startDate,
              endDate: opts.endDate,
              approvalStatus: opts.status,
              hourlySearchInterval: opts.hourlySearchInterval
            }),
      opts.envFile,
      {
        loadingText: 'Faturalar yükleniyor...'
      }
    );

    let selectedInvoices = invoices;

    if (opts.interactive) {
      selectedInvoices = await createInvoicesTable(invoices);
    }

    switch (opts.type) {
      case 'csv':
        await actions.invoicesExportToCsv(selectedInvoices, opts);
        break;
      case 'json':
        await actions.invoicesExportToJson(selectedInvoices, opts);
        break;
      case 'excel':
        await actions.invoicesExportToExcel(selectedInvoices, opts);
        break;
    }
  });

export default exportInvoicesCommand;
