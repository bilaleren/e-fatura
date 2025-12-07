import { createCommand } from 'commander';
import {
  EInvoiceApiClient,
  exitProgram,
  createInvoicesTable,
  commandWithDateOptions,
  commandWithStatusOption,
  commandWithEnvFileOption,
  commandWithHourlySearchIntervalOption,
  type CommandWithDateOptions,
  type CommandWithStatusOption,
  type CommandWithEnvFileOption,
  type CommandWithHourlySearchIntervalOption
} from '../utils';

interface ListInvoicesOpts
  extends CommandWithDateOptions,
    CommandWithStatusOption,
    CommandWithEnvFileOption,
    CommandWithHourlySearchIntervalOption {
  readonly downloadPath: string;
}

const listInvoicesCommand = createCommand('list').description(
  'e-Arşiv üzerinde bulunan faturaları listele'
);

commandWithDateOptions(listInvoicesCommand);
commandWithStatusOption(listInvoicesCommand);
commandWithEnvFileOption(listInvoicesCommand);
commandWithHourlySearchIntervalOption(listInvoicesCommand);

listInvoicesCommand.action(async function () {
  if (!process.stdout.isTTY) {
    return exitProgram();
  }

  const opts = this.opts<ListInvoicesOpts>();

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

  await createInvoicesTable(invoices, {
    selectable: false,
    emptyDescription: 'Listelenecek fatura bulunamadı.'
  });
});

export default listInvoicesCommand;
