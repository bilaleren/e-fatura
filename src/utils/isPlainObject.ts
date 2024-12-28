function isPlainObject(value: unknown): value is Record<string, any> {
  return value != null && Object.getPrototypeOf(value) === Object.prototype
}

export default isPlainObject
