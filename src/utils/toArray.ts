function toArray<T>(value: T | T[]): T[] {
  return ([] as unknown[]).concat(value) as T[]
}

export default toArray
