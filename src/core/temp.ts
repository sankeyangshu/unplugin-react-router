import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const TEMP_DIR = '.temp';
const EXCLUDE_GLOB = '.exclude-glob.json';

/**
 * get exclude glob file path
 * @descCN 获取 .exclude-glob.json (创建排除规则文件) 文件路径
 * @param root project root path
 * @returns exclude glob path
 */
function getExcludeGlobPath(root: string) {
  return resolve(root, TEMP_DIR, EXCLUDE_GLOB);
}

/**
 * get exclude glob
 * @descCN 获取排除 glob
 * @param root project root path
 * @returns exclude glob
 */
async function getExcludeGlob(root: string) {
  const excludeGlobPath = getExcludeGlobPath(root);

  let excludeGlobs: string[] = [];

  try {
    const content = await readFile(excludeGlobPath, 'utf-8');
    excludeGlobs = JSON.parse(content);
  } catch {
    excludeGlobs = [];
  }

  return excludeGlobs;
}

/**
 * is in exclude glob
 * @descCN 判断是否在排除 glob 中
 * @param root project root path
 * @param glob glob
 */
export async function isInExcludeGlob(root: string, glob: string) {
  const excludeGlobs = await getExcludeGlob(root);
  return excludeGlobs.includes(glob);
}
