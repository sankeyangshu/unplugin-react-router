import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * ensure file, if not exist, create it
 * @descCN 确保文件存在，如果不存在，则创建
 * @param filepath file path
 */
export async function ensureFile(filepath: string) {
  const exist = existsSync(filepath);

  if (!exist) {
    await mkdir(dirname(filepath), { recursive: true });
  }
}
