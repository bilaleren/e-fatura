import dayjs from 'dayjs';
import { createOption, type Command } from 'commander';
import periodConvertToDateRange, {
  Period,
  DATE_FORMAT,
  type DateRange
} from './periodConvertToDateRange';

export interface CommandWithDateOptions extends DateRange {
  readonly period?: Period;
}

function commandWithDateOptions(command: Command): Command {
  const periodOption = createOption(
    '--period [period]',
    'Faturaların düzenlenlenme dönemi/periyodu'
  ).choices(Object.values(Period));

  const startDateOption = createOption(
    '--start-date [date]',
    `Faturaların düzenlenme dönemi aralığı başlangıç tarihi (${DATE_FORMAT} formatında)`
  );

  const endDateOption = createOption(
    '--end-date [date]',
    `Faturaların düzenlenme dönemi aralığı bitiş tarihi (${DATE_FORMAT} formatında)`
  );

  return command
    .addOption(periodOption)
    .addOption(startDateOption)
    .addOption(endDateOption)
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts<CommandWithDateOptions>();

      if (opts.period) {
        const dateRange = periodConvertToDateRange(opts.period);

        thisCommand.setOptionValue(
          startDateOption.attributeName(),
          dateRange.startDate
        );

        thisCommand.setOptionValue(
          endDateOption.attributeName(),
          dateRange.endDate
        );
      } else {
        if (opts.startDate) {
          const startDate = dayjs(opts.startDate, DATE_FORMAT);

          if (!startDate.isValid()) {
            thisCommand.error(
              `--${startDateOption.name()} is not a valid date.`
            );
          }
        }

        if (opts.endDate) {
          const endDate = dayjs(opts.endDate, DATE_FORMAT);

          if (!endDate.isValid()) {
            thisCommand.error(`--${endDateOption.name()} is not a valid date.`);
          }
        }
      }
    });
}

export default commandWithDateOptions;
