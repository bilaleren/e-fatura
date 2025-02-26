import * as fs from 'fs/promises';
import type { PathLike } from 'node:fs';

async function isDirectoryExists(path: PathLike): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export default isDirectoryExists;
