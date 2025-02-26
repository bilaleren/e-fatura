import Print from './Print';
import { AbortPromptError } from '@inquirer/core';
import { table, type TableValue, type TableColumn } from 'inquirer-table';
import chalk from 'chalk';
import type { KnownKeys } from '../types';
import type { BasicInvoice } from 'e-fatura';

export const basicInvoiceKeyMap: Record<keyof KnownKeys<BasicInvoice>, string> =
  {
    uuid: 'ETTN',
    titleOrFullName: 'Unvan/Ad Soyad',
    documentDate: 'Düzenlenme Tarihi',
    taxOrIdentityNumber: 'VKN/TCKN',
    documentType: 'Belge Türü',
    documentNumber: 'Belge No',
    approvalStatus: 'Durum'
  };

const columns: TableColumn<BasicInvoice>[] = [
  {
    header: '#',
    renderCell: (_, index) => index + 1
  },
  {
    header: basicInvoiceKeyMap.uuid,
    accessorKey: 'uuid'
  },
  {
    header: basicInvoiceKeyMap.titleOrFullName,
    width: 25,
    accessorKey: 'titleOrFullName'
  },
  {
    header: basicInvoiceKeyMap.documentDate,
    align: 'center',
    accessorKey: 'documentDate'
  },
  {
    header: basicInvoiceKeyMap.documentType,
    align: 'center',
    accessorKey: 'documentType'
  },
  {
    header: basicInvoiceKeyMap.taxOrIdentityNumber,
    accessorKey: 'taxOrIdentityNumber'
  },
  {
    header: basicInvoiceKeyMap.documentDate,
    accessorKey: 'documentNumber'
  },
  {
    header: basicInvoiceKeyMap.approvalStatus,
    accessorKey: 'approvalStatus'
  }
];

export interface CreateInvoicesTableOptions<
  TSelectable extends boolean,
  TMultiple extends boolean
> {
  multiple?: TMultiple;
  selectable?: TSelectable;
  emptyDescription?: string;
  emptyResultDescription?: string;
}

async function createInvoicesTable<
  TSelectable extends boolean = true,
  TMultiple extends boolean = true
>(
  invoices: BasicInvoice[],
  options?: CreateInvoicesTableOptions<TSelectable, TMultiple>
): Promise<TableValue<BasicInvoice, TSelectable, TMultiple>> {
  const {
    multiple = true,
    selectable = true,
    emptyDescription = 'İşlem yapılacak fatura bulunamadı.',
    emptyResultDescription = 'Herhangi bir fatura seçmedin. İşlem yapmak için en az bir fatura seçin.'
  } = options || {};

  if (invoices.length === 0) {
    Print.warn(emptyDescription);
    return process.exit();
  }

  const controller = new AbortController();
  const result = await table(
    {
      data: invoices,
      columns,
      pageSize: 10,
      multiple: multiple as TMultiple,
      selectable: selectable as TSelectable,
      renderHeader: ({ multiple, selectable, abortController }) => {
        const header: string[] = [];

        if (selectable && multiple) {
          header.push(`${chalk.cyan('<space>')} satırı seçmek için`);
        }

        header.push(
          `${chalk.cyan('<up>')} ve ${chalk.cyan(
            '<down>'
          )} satırlar arasında gezinmek için`
        );

        if (selectable) {
          header.push(
            `${chalk.cyan('<enter>')} ${
              multiple ? 'seçimleri' : 'seçimi'
            } onaylamak için`
          );
        }

        if (abortController) {
          header.push(`${chalk.cyan('<backspace>')} iptal etmek için`);
        }

        return header.length ? `(${header.join(', ')}) tuşlarına basın` : null;
      },
      renderFooter: ({ data, range, pageSize, selectable, selectedRows }) => {
        const footer: string[] = [];
        const countOfData = data.length;

        if (countOfData > pageSize) {
          const [startRange, endRange] = range;

          footer.push(
            `Toplam ${countOfData} ögeden ${startRange} - ${endRange} gösteriliyor.`
          );

          if (selectable) {
            footer.push(` (${selectedRows.length} öge seçildi.)`);
          }
        } else if (selectable) {
          footer.push(`${selectedRows.length} öge seçildi.`);
        }

        return footer.join('');
      },
      abortController: controller
    },
    { signal: controller.signal }
  ).catch((error: Error) => {
    if (error.name === AbortPromptError.name) {
      return undefined;
    }

    throw error;
  });

  if (!result) {
    Print.info('İşlem iptal edildi.');
    return process.exit();
  }

  if (Array.isArray(result) && result.length === 0) {
    Print.warn(emptyResultDescription);
    return process.exit();
  }

  return result;
}

export default createInvoicesTable;
