import { createOption, type Command } from 'commander';
import { HourlySearchInterval } from 'e-fatura';
import type { UnderscoreToDash } from '../types';

type HourlySearchIntervalKeys = UnderscoreToDash<
  Lowercase<keyof typeof HourlySearchInterval>
>;

export interface CommandWithHourlySearchIntervalOption {
  readonly issuedToMe?: boolean;
  readonly hourlySearchInterval?: HourlySearchInterval;
}

const hourlySearchIntervalKeyMap: Record<
  HourlySearchIntervalKeys,
  HourlySearchInterval
> = {
  none: HourlySearchInterval.NONE,
  'first-half': HourlySearchInterval.FIRST_HALF,
  'last-half': HourlySearchInterval.LAST_HALF
};

function commandWithHourlySearchIntervalOption(command: Command): Command {
  const hourlySearchIntervalOption = createOption(
    '--hourly-search-interval [value]',
    'Adınıza düzenlenen faturaların günün hangi aralığında düzenlendiği'
  ).choices(Object.keys(hourlySearchIntervalKeyMap));

  return command
    .option('--issued-to-me', 'Adınıza düzenlenen faturaları listele')
    .addOption(hourlySearchIntervalOption)
    .hook('preAction', (thisCommand) => {
      const hourlySearchIntervalKey = thisCommand.getOptionValue(
        hourlySearchIntervalOption.attributeName()
      ) as HourlySearchIntervalKeys | undefined;

      if (hourlySearchIntervalKey) {
        thisCommand.setOptionValue(
          hourlySearchIntervalOption.attributeName(),
          hourlySearchIntervalKeyMap[hourlySearchIntervalKey]
        );
      }
    });
}

export default commandWithHourlySearchIntervalOption;
