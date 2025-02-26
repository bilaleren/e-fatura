import objectGet from './objectGet';

export type FormatValues =
  | Record<string, unknown>
  | (string | number | boolean)[];

const FORMAT_REGEX = /\{[a-zA-Z0-9-_.]+}/g;

function formatValue(value: any, property: string): string {
  switch (typeof value) {
    case 'string':
    case 'bigint':
    case 'number':
    case 'boolean':
      return `${value}`;
    case 'object':
      return JSON.stringify(value);
    default:
      return property;
  }
}

function format(tmpl: string, values?: FormatValues): string {
  if (!values) {
    return tmpl;
  }

  return tmpl.replace(FORMAT_REGEX, (property: string) => {
    const key = property.slice(1, -1);

    return property.replace(
      property,
      formatValue(objectGet(values, key, property), property)
    );
  });
}

export default format;
