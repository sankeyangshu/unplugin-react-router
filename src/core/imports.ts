import { writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME } from '../constants';
import { createPrefixCommentOfGenFile, ensureFile } from '../utils';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';

/**
 * get imports code
 * @descCN 获取 imports 代码
 * @param nodes nodes 节点
 * @param options options 配置选项
 */
function getImportsCode(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { layouts } = options;

  const prefixComment = createPrefixCommentOfGenFile();

  let importCode = `import type { RouteFileKey, RouteLayoutKey } from "${UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME}";\n`;

  let exportLayoutCode = `\nexport const layouts: Record<RouteLayoutKey, () => Promise<any>> = {`;

  layouts.forEach((layout) => {
    // FIXME: 这里的isLazy需要研究一下
    const { name, importName, importPath, isLazy } = layout;

    if (isLazy) {
      exportLayoutCode += `\n  ${name}: () => import("${importPath}"),`;
    } else {
      importCode += `import ${importName} from "${importPath}";\n`;
      exportLayoutCode += `\n  ${name}: ${importName},`;
    }
  });

  exportLayoutCode += '\n};\n';

  let exportPages = `export const pages: Record<RouteFileKey, () => Promise<any>> = {`;

  nodes
    .filter((node) => !node.isBuiltin && !node.isReuse)
    .forEach((node) => {
      const { name, importName, importPath, isLazy } = node;

      if (isLazy) {
        exportPages += `\n  ${name}: () => import("${importPath}"),`;
      } else {
        importCode += `import ${importName} from "${importPath}";\n`;
        exportPages += `\n  ${name}${name === importName ? '' : `: ${importName}`},`;
      }
    });

  exportPages += '\n};\n';

  // TODO: 错误组件可能不需要，待定
  // let exportError = `export const errors: Record<string, () => Promise<any>> = {`;

  return `${prefixComment}\n\n${importCode}${exportLayoutCode}\n${exportPages}`;
}

/**
 * generate imports file
 * @descCN 生成 imports 文件
 * @param nodes nodes 节点
 * @param options options 配置选项
 */
export async function generateImportsFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const importsPath = posix.join(cwd, routerGeneratedDir, 'imports.ts');

  await ensureFile(importsPath);

  const code = getImportsCode(nodes, options);

  await writeFile(importsPath, code);
}
