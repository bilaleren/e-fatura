import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';

export enum Period {
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this-week',
  PREV_WEEK = 'prev-week',
  THIS_MONTH = 'this-month',
  PREV_MONTH = 'prev-month',
  THIS_YEAR = 'this-year',
  PREV_YEAR = 'prev-year'
}

export interface DateRange {
  readonly startDate: string;
  readonly endDate: string;
}

function periodConvertToDateRange(period: Period): DateRange {
  let startDate: dayjs.Dayjs;
  let endDate: dayjs.Dayjs;

  switch (period) {
    case Period.YESTERDAY: {
      const date = dayjs().subtract(1, 'day');

      startDate = date.startOf('day');
      endDate = date.endOf('day');
      break;
    }
    case Period.THIS_WEEK: {
      const date = dayjs();

      startDate = date.startOf('week');
      endDate = date.endOf('week');
      break;
    }
    case Period.PREV_WEEK: {
      const date = dayjs().subtract(1, 'week');

      startDate = date.startOf('week');
      endDate = date.endOf('week');
      break;
    }
    case Period.THIS_MONTH: {
      const date = dayjs();

      startDate = date.startOf('month');
      endDate = date.endOf('day');
      break;
    }
    case Period.PREV_MONTH: {
      const date = dayjs().subtract(1, 'month');

      startDate = date.startOf('month');
      endDate = date.endOf('month');
      break;
    }
    case Period.THIS_YEAR: {
      const date = dayjs();

      startDate = date.startOf('year');
      endDate = date.endOf('day');
      break;
    }
    case Period.PREV_YEAR: {
      const date = dayjs().subtract(1, 'year');

      startDate = date.startOf('year');
      endDate = date.endOf('year');
      break;
    }
  }

  return {
    startDate: startDate.format(DATE_FORMAT),
    endDate: endDate.format(DATE_FORMAT)
  };
}

export default periodConvertToDateRange;
