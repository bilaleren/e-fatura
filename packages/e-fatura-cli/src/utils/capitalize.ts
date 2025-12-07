function capitalize<T extends string>(value: T): Capitalize<T> {
  value = value.toLowerCase() as T;
  return (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<T>;
}

export default capitalize;
