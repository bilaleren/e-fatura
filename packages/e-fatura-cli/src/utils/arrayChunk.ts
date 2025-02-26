function arrayChunk<T>(array: T[], size: number): T[][] {
  let i = 0;
  const chunks: T[][] = [];

  while (i < array.length) {
    chunks.push(array.slice(i, (i += size)));
  }

  return chunks;
}

export default arrayChunk;
