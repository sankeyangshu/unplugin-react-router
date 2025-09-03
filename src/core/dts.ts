import { writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { NOT_FOUND_ROUTE_NAME, ROOT_ROUTE_NAME, UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME } from '../constants';
import { createPrefixCommentOfGenFile, ensureFile } from '../utils';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';

/**
 * get reuse route dts code
 * @descCN 获取复用路由 dts 代码
 * @param nodes nodes 节点
 */
function getReuseRouteDtsCode(nodes: AutoRouterNode[]) {
  if (!nodes.length) {
    return `

  /**
   * reuse route key
   */
  export type ReuseRouteKey = never;`;
  }

  let code = `

  /**
   * reuse route key
   */
  export type ReuseRouteKey = Extract<
    RouteKey,`;

  nodes.forEach((node) => {
    code += `\n    | "${node.name}"`;
  });

  code += `
  >;`;

  return code;
}

/**
 * get dts code
 * @descCN 获取 dts 代码
 * @param nodes nodes 节点
 * @param options options 配置选项
 */
function getDtsCode(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { layouts } = options;

  const layoutKeys = layouts.map((layout) => layout.name);
  const reuseNodes = nodes.filter((node) => node.isReuse);

  const prefixComment = createPrefixCommentOfGenFile();

  let code = `${prefixComment}

declare module "${UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME}" {

  /**
   * route layout key
   */
  export type RouteLayoutKey = ${layoutKeys.map((key) => `"${key}"`).join(' | ')};

  /**
   * route path map
   */
  export type RoutePathMap = {`;

  nodes.forEach((node) => {
    code += `\n    "${node.name}": "${node.fullPath}";`;
  });

  code += `
  };

  /**
   * route key
   */
  export type RouteKey = keyof RoutePathMap;

  /**
   * route path
   */
  export type RoutePath = RoutePathMap[RouteKey];

  /**
   * root route key
   */
  export type RootRouteKey = '${ROOT_ROUTE_NAME}';

  /**
   * not found route key
   */
  export type NotFoundRouteKey = '${NOT_FOUND_ROUTE_NAME}';

  /**
   * builtin route key
   */
  export type BuiltinRouteKey = RootRouteKey | NotFoundRouteKey;`;

  code += getReuseRouteDtsCode(reuseNodes);

  code += `

  /**
   * the route file key, which has it's own file
   */
  export type RouteFileKey = Exclude<RouteKey, BuiltinRouteKey | ReuseRouteKey>;

  /**
   * mapped name and fullPath
   */
  type MappedNamePath = {
    [K in RouteKey]: { name: K; fullPath: RoutePathMap[K] };
  }[RouteKey];
}
`;

  return code;
}

/**
 * generate dts file
 * @descCN 生成 dts 文件
 * @param nodes nodes 节点
 * @param options options 配置选项
 */
export async function generateDtsFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const dtsPath = posix.join(options.cwd, options.dts);

  await ensureFile(dtsPath);

  const dtsCode = getDtsCode(nodes, options);

  await writeFile(dtsPath, dtsCode);
}
