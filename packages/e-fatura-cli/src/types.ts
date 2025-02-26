export type KnownKeys<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

export type UnderscoreToDash<S extends string> =
  S extends `${infer A}_${infer B}` ? `${A}-${B}` : S;
