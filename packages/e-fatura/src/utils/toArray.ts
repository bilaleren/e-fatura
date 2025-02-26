function toArray<T>(value: T | T[]): T[] {
  return ([] as T[]).concat(value);
}

export default toArray;
