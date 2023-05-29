function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    value !== null &&
    value !== undefined &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

export default isPlainObject
