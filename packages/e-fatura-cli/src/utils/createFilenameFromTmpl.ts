import format from './format';

export type FilenameExt =
  | 'zip'
  | 'xml'
  | 'pdf'
  | 'html'
  | 'csv'
  | 'json'
  | 'xlsx';

export interface CreateFilenameFromTmplOptions {
  ext?: FilenameExt;
  values?: Record<string, any>;
}

const leadingZero = (value: number) => value.toString().padStart(2, '0');

function createFilenameFromTmpl(
  tmpl: string,
  options?: CreateFilenameFromTmplOptions
): string {
  const { ext = 'zip', values } = options || {};

  const date = new Date();

  return format(tmpl, {
    ...values,
    ext,
    day: leadingZero(date.getDate()),
    date: leadingZero(date.getDate()),
    year: date.getFullYear(),
    month: leadingZero(date.getMonth() + 1),
    hour: leadingZero(date.getHours()),
    minute: leadingZero(date.getMinutes())
  });
}

export default createFilenameFromTmpl;
