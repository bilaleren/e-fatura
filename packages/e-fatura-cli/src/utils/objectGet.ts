function objectGet(
  object: unknown,
  path: string | (string | number)[],
  defaultValue?: any
): any {
  const keys = typeof path === 'string' ? path.split('.') : path;

  return keys.length > 0
    ? keys.reduce(
        (acc, curr) => (acc != null ? acc[curr] : defaultValue),
        object
      )
    : defaultValue;
}

export default objectGet;
