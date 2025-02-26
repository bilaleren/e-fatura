import arrayChunk from './arrayChunk';
import shortenText from './shortenText';
import createListr from './createListr';
import type Listr from 'listr';
import type { BasicInvoice } from 'e-fatura';

class InvoiceTasksContext {
  private readonly countOfTasks!: number;

  countOfSkips = 0;
  countOfErrors = 0;

  constructor(countOfTasks: number) {
    this.countOfTasks = countOfTasks;
  }

  get countOfCompleted(): number {
    return this.countOfTasks - this.countOfSkips - this.countOfErrors;
  }
}

export interface CreateInvoiceTasksOptions {
  task: (
    invoice: BasicInvoice,
    task: Listr.ListrTaskWrapper<InvoiceTasksContext>
  ) => Promise<void>;
  batchSize?: number;
  taskTitle?: (args: { index: number; invoice: BasicInvoice }) => string;
}

async function createInvoiceTasks(
  invoices: BasicInvoice[],
  options: CreateInvoiceTasksOptions
): Promise<InvoiceTasksContext> {
  const {
    task,
    batchSize = 30,
    taskTitle = ({ invoice }) =>
      `[${invoice.uuid}] ${shortenText(invoice.titleOrFullName)} (${
        invoice.documentDate
      })`
  } = options;

  const chunks = arrayChunk(invoices, batchSize);
  const tasks = chunks.map((chunkItems) =>
    createListr<InvoiceTasksContext>(
      chunkItems.map((invoice, index) => ({
        title: taskTitle({ index, invoice }),
        task: async (ctx, taskWrapper) => {
          const prevSkipTask = taskWrapper.skip.bind(taskWrapper);

          taskWrapper.skip = function (message) {
            ctx.countOfSkips++;
            return prevSkipTask(message);
          };

          try {
            return await task(invoice, taskWrapper);
          } catch (err) {
            ctx.countOfErrors++;
            throw err;
          }
        }
      })),
      {
        exitOnError: false
      }
    )
  );

  const context = new InvoiceTasksContext(invoices.length);

  for (const task of tasks) {
    try {
      await task.run(context);
    } catch {
      // no-empty
    }
  }

  return context;
}

export default createInvoiceTasks;
