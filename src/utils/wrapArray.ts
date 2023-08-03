type WrapArray<T> = T extends Array<any> ? T : T[]

function wrapArray<T>(value: T): WrapArray<T> {
  return ([] as unknown[]).concat(value) as WrapArray<T>
}

export default wrapArray
