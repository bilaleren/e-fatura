import * as fs from 'fs/promises';
import type { PathLike } from 'node:fs';

async function isFileExists(path: PathLike): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

export default isFileExists;
