import { createOption, type Command } from 'commander';
import { InvoiceApprovalStatus } from 'e-fatura';
import type { UnderscoreToDash } from '../types';

type InvoiceApprovalStatusKeys = UnderscoreToDash<
  Lowercase<keyof typeof InvoiceApprovalStatus>
>;

export interface CommandWithStatusOption {
  readonly status?: InvoiceApprovalStatus;
}

const invoiceApprovalStatusKeyMap: Record<
  InvoiceApprovalStatusKeys,
  InvoiceApprovalStatus
> = {
  approved: InvoiceApprovalStatus.APPROVED,
  unapproved: InvoiceApprovalStatus.UNAPPROVED,
  deleted: InvoiceApprovalStatus.DELETED
};

function commandWithStatusOption(command: Command): Command {
  const statusOption = createOption(
    '--status [status]',
    'Faturaların onay durumu'
  ).choices(Object.keys(invoiceApprovalStatusKeyMap));

  return command.addOption(statusOption).hook('preAction', (thisCommand) => {
    const statusKey = thisCommand.getOptionValue(
      statusOption.attributeName()
    ) as InvoiceApprovalStatusKeys | undefined;

    if (statusKey) {
      thisCommand.setOptionValue(
        statusOption.attributeName(),
        invoiceApprovalStatusKeyMap[statusKey]
      );
    }
  });
}

export default commandWithStatusOption;
