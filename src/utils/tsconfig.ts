import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import stripJsonComments from 'strip-json-comments';
import { normalizePath } from 'unplugin-utils';

/**
 * resolve alias from tsconfig.json
 * @descCN 从 tsconfig.json 中解析别名
 * @param cwd - the cwd of the project
 * @param tsconfigPath - the path of the tsconfig.json file
 * @returns the alias
 */
export function resolveAliasFromTsConfig(cwd: string, tsconfigPath: string = 'tsconfig.json') {
  const tsconfig = readFileSync(resolve(cwd, tsconfigPath), 'utf-8');

  let paths: Record<string, string[]> | undefined;

  try {
    paths = JSON.parse(stripJsonComments(tsconfig))?.compilerOptions?.paths;
  } catch (err) {
    throw new Error(`Failed to parse tsconfig.json: ${err}`);
  }

  const alias: Record<string, string> = {};

  Object.entries(paths ?? {}).forEach(([key, value]) => {
    // only keep the key before the last `/*`
    const newKey = key.replace(/\/\*$/, '');

    alias[newKey] = normalizePath(join(cwd, value[0].replace(/\/\*$/, '')));
  });

  return alias;
}
