import chalk from 'chalk';
import input from '@inquirer/input';
import { createCommand } from 'commander';
import { InvoiceApprovalStatus } from 'e-fatura';
import {
  Print,
  EInvoiceApiClient,
  createInvoicesTable,
  commandWithDateOptions,
  commandWithEnvFileOption,
  type CommandWithDateOptions,
  type CommandWithEnvFileOption
} from '../utils';
import { E_ARCHIVE_VERIFICATION_CODE_LENGTH } from '../constants';

type SigInvoicesOpts = CommandWithDateOptions & CommandWithEnvFileOption;

const signInvoicesCommand = createCommand('sign').description(
  'e-Arşiv üzerinde bulunan faturaları imzala'
);

commandWithDateOptions(signInvoicesCommand);
commandWithEnvFileOption(signInvoicesCommand);

signInvoicesCommand.action(async function () {
  if (!process.stdout.isTTY) {
    process.exit();
  }

  const opts = this.opts<SigInvoicesOpts>();
  const credentials = await EInvoiceApiClient.getCredentials(opts.envFile);

  if (credentials.password === '1') {
    Print.warn('Fatura imzalama işlemi test hesapları ile gerçekleştirilemez.');
    process.exit();
  }

  await EInvoiceApiClient.login(opts.envFile);

  const invoices = await EInvoiceApiClient.exec(
    (client) =>
      client.getBasicInvoices({
        startDate: opts.startDate,
        endDate: opts.endDate,
        approvalStatus: InvoiceApprovalStatus.UNAPPROVED
      }),
    opts.envFile,
    {
      loadingText: 'Faturalar yükleniyor...'
    }
  );

  const selectedInvoices = await createInvoicesTable(invoices);

  const sendCodeResult = await EInvoiceApiClient.exec(
    (client) => client.sendSMSCode(),
    opts.envFile,
    {
      loadingText: 'Doğrulama kodu gönderiliyor...'
    }
  );

  const verificationCode = await input({
    message: `(${chalk.cyan(
      sendCodeResult.phoneNumber
    )}) telefon numarasına gönderilen doğrulama kodunu girin:`,
    validate: (value) =>
      value.length === E_ARCHIVE_VERIFICATION_CODE_LENGTH ||
      `Doğrulama kodu ${E_ARCHIVE_VERIFICATION_CODE_LENGTH} haneli olmalıdır.`
  });

  const verifyCodeResult = await EInvoiceApiClient.exec(
    (client) =>
      client.signInvoices(
        verificationCode,
        sendCodeResult.oid,
        selectedInvoices
      ),
    opts.envFile,
    {
      loadingText: 'Faturalar imzalanıyor...'
    }
  );

  if (verifyCodeResult) {
    Print.success('Faturalar başarılı bir şekilde imzalandı.');
  } else {
    Print.error('Faturalar imzalanamadı.');
  }
});

export default signInvoicesCommand;
