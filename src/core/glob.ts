import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { globSync } from 'tinyglobby';
import { normalizePath } from 'unplugin-utils';
import { resolveImportPath } from '../utils';
import type { ParsedAutoRouterOptions, ResolvedGlob } from '../types';

/**
 * resolve glob
 * @descCN 将单个 glob 匹配结果转换为标准化路由文件描述对象
 * @param glob glob 匹配到的相对路径
 * @param pageDir pageDir 页面目录（如 src/pages）
 * @param options options 选项（如 root 和 alias）
 */
function resolveGlob(glob: string, pageDir: string, options: Pick<ParsedAutoRouterOptions, 'cwd' | 'alias'>) {
  const { cwd, alias } = options;

  const newPageDir = resolve(cwd, pageDir);

  const filePath = normalizePath(resolve(newPageDir, glob));
  const importPath = resolveImportPath(filePath, alias);

  const resolvedGlob: Omit<ResolvedGlob, 'inode'> = {
    pageDir,
    glob,
    filePath,
    importPath,
  };

  return resolvedGlob as ResolvedGlob;
}

/**
 * resolve globs
 * @descCN 解析所有页面 glob 匹配结果
 * @param options options 选项
 */
export async function resolveGlobs(options: ParsedAutoRouterOptions) {
  const { cwd, pageDir, pageInclude, pageExclude } = options;

  const pageDirs = Array.isArray(pageDir) ? pageDir : [pageDir];

  const pageGlobs = pageDirs.flatMap((item) => {
    const newPageDir = resolve(cwd, item);

    const globs = globSync(pageInclude, {
      cwd: newPageDir,
      onlyFiles: true,
      ignore: pageExclude,
    });

    return globs.map((glob) => resolveGlob(glob, item, options));
  });

  const globs: ResolvedGlob[] = await Promise.all(
    pageGlobs.map(async (glob) => {
      const info = await stat(glob.filePath);

      return {
        ...glob,
        inode: info.ino,
      };
    })
  );

  return globs;
}
