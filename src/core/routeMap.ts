import { writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME } from '../constants';
import { createPrefixCommentOfGenFile, ensureFile } from '../utils';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';

/**
 * get route map code
 * @descCN 获取路由映射代码
 * @param nodes nodes 节点
 * @returns code 代码
 */
function getRouteMapCode(nodes: AutoRouterNode[]) {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { RouteKey, RoutePathMap } from '${UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME}';

/**
 * map of route name and route path
 */
const routePathMap: RoutePathMap = {
  ${nodes.map((node) => `"${node.name}": "${node.fullPath}",`).join('\n  ')}
};

/**
 * get route path by route key
 * @param key route key
 */
export function getRoutePath(key: RouteKey) {
  return routePathMap[key];
}
`;

  return code;
}

/**
 * generate route map file
 * @descCN 生成路由映射文件
 * @param nodes nodes 节点
 * @param options options 配置选项
 */
export async function generateRouteMapFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const routeMapPath = posix.join(cwd, routerGeneratedDir, 'routeMap.ts');

  await ensureFile(routeMapPath);

  const code = getRouteMapCode(nodes);

  await writeFile(routeMapPath, code);
}
