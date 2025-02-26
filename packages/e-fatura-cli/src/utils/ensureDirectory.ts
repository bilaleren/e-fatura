import * as fs from 'fs/promises';
import isDirectoryExists from './isDirectoryExists';
import type { MakeDirectoryOptions, Mode, PathLike } from 'fs';

async function ensureDirectory(
  path: PathLike,
  options?: Mode | MakeDirectoryOptions
): Promise<void> {
  if (!(await isDirectoryExists(path))) {
    await fs.mkdir(path, options);
  }
}

export default ensureDirectory;
