type ToArray<T> = T extends Array<infer I> ? I[] : T[]

function toArray<T>(value: T): ToArray<T> {
  return ([] as unknown[]).concat(value) as ToArray<T>
}

export default toArray
