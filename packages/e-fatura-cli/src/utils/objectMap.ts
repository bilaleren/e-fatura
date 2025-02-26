function objectMap<T extends Record<string, any>, R>(
  object: T,
  callback: (key: keyof T, value: T[keyof T], index: number) => R
): R[] {
  return Object.keys(object).map((key, index) =>
    callback(key, object[key], index)
  );
}

export default objectMap;
