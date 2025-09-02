import { yellow } from 'ansis';
import { BUILT_IN_ROUTE, NO_FILE_INODE, NOT_FOUND_ROUTE_NAME, ROOT_ROUTE_NAME } from '../constants';
import { getImportName, logger, tokenizePath } from '../utils';
import { getNodeBackup } from './temp';
import type {
  AutoRouterNode,
  AutoRouterParamType,
  NodeStatInfo,
  ParsedAutoRouterOptions,
  ResolvedGlob,
} from '../types';

/**
 * resolve glob path
 * @descCN 解析 glob 路径
 * @param resolvedGlob resolvedGlob 解析后的路径
 * @param extension extension 扩展名
 */
function resolveGlobPath(resolvedGlob: ResolvedGlob, extension: string[]) {
  const { glob } = resolvedGlob;

  let globPath = glob;

  // 如果 glob 不以 / 开头，则添加 /
  if (!globPath.startsWith('/')) {
    globPath = `/${globPath}`;
  }

  // 如果 glob 以 .ext 结尾，则删除 .ext
  extension.forEach((ext) => {
    if (globPath.endsWith(`.${ext}`)) {
      globPath = globPath.replace(`.${ext}`, '');
    }
  });

  if (globPath.endsWith('/index')) {
    globPath = globPath.replace(/\/index$/, '');
  }

  return globPath;
}

/**
 * resolve group node
 * @descCN 解析分组节点
 *
 * @example
 *   `src/pages/(builtin)/login/index.tsx`;
 *
 * @param glob glob 解析后的路径
 */
function resolveGroupNode(node: AutoRouterNode) {
  const GROUP_REG = /\/\((\w+)\)\//;

  const match = node.fullPath.match(GROUP_REG);

  if (match) {
    const [matchItem, group] = match;
    node.group = group;
    node.fullPath = node.fullPath.replace(matchItem, '/');
  }

  return node;
}

/**
 * transform optional params path
 * @descCN 转换可选参数路径
 * @param nodePath node 路径
 */
function transformOptionalParamsPath(nodePath: string) {
  const OPTIONAL_PARAM_REG = /\[\[(\w+)\]\]/g;

  const match = nodePath.match(OPTIONAL_PARAM_REG);

  if (!match) {
    return null;
  }

  let formatPath = nodePath.replace(OPTIONAL_PARAM_REG, ':$1?');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:(\w+\?\w+|\w{2,})\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, (item) => item.replace('_', '/'));

  return formatPath;
}

/**
 * transform required params path
 * @descCN 转换必选参数路径
 * @param nodePath node 路径
 */
function transformRequiredParamsPath(nodePath: string) {
  const PARAM_REG = /\[(\w+)\]/g;

  const match = nodePath.match(PARAM_REG);

  if (!match) {
    return null;
  }

  let formatPath = nodePath.replace(PARAM_REG, ':$1');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:(\w+\?\w+|\w{2,})\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, (item) => item.replace('_', '/'));

  return formatPath;
}

/**
 * transform param node
 * @descCN 解析参数节点
 *
 * @example
 *   `src/pages/list/[id].tsx`;
 *   `src/pages/list/[[id]].tsx`;
 *   `src/pages/list/edit_[id]_[userId].tsx`;
 *   `src/pages/list/detail/[id]/[userId].tsx`;
 *
 * @param node node 节点
 */
function transformParamNode(node: AutoRouterNode) {
  // 将 [id]/[[id]] 转换为 /:id/:id?
  const optional = transformOptionalParamsPath(node.fullPath);

  if (optional) {
    node.fullPath = optional;
  } else {
    const required = transformRequiredParamsPath(node.fullPath);
    if (required) {
      node.fullPath = required;
    }
  }

  return node;
}

/**
 * get params from path
 * @descCN 从路径中获取参数
 * @param path
 */
function getParamsFromPath(path: string) {
  const tokens = tokenizePath(path);

  const params: Record<string, AutoRouterParamType> = {};

  tokens.forEach((token) => {
    token.forEach((item) => {
      if (item.type === 'param') {
        params[item.value] = item.optional ? 'optional' : 'required';
      }
    });
  });

  return params;
}

/**
 * resolve node
 * @descCN 解析节点
 * @param resolvedGlob resolvedGlob 解析后的路径
 * @param options options 配置选项
 */
function resolveNode(resolvedGlob: ResolvedGlob, options: ParsedAutoRouterOptions) {
  const { getRouteName, getRoutePath, getRouteLayout, routeLazyImport } = options;

  const resolvedPath = resolveGlobPath(resolvedGlob, options.pageExtension);

  let node: AutoRouterNode = {
    ...resolvedGlob,
    fullPath: resolvedPath,
    name: '',
    originPath: resolvedPath,
    get component() {
      return node.name;
    },
    get layout() {
      return getRouteLayout(node);
    },
    get importName() {
      return getImportName(node.name);
    },
    get isLazy() {
      return routeLazyImport(node.name);
    },
  };

  node = resolveGroupNode(node);
  node = transformParamNode(node);
  node.name = getRouteName(node);
  node.fullPath = getRoutePath(node);
  node.params = getParamsFromPath(node.fullPath);

  return node;
}

/**
 * create builtin node
 * @descCN 创建内置节点
 * @param options options 配置选项
 */
function createBuiltinNode(options: ParsedAutoRouterOptions) {
  const { notFoundRouteComponent, getRouteLayout } = options;

  const rootPath = BUILT_IN_ROUTE[ROOT_ROUTE_NAME];

  const rootNode: AutoRouterNode = {
    fullPath: rootPath,
    name: ROOT_ROUTE_NAME,
    originPath: rootPath,
    component: '',
    layout: '',
    isBuiltin: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE,
  };

  const notFoundPath = BUILT_IN_ROUTE[NOT_FOUND_ROUTE_NAME];

  const notFoundNode: AutoRouterNode = {
    fullPath: notFoundPath,
    name: NOT_FOUND_ROUTE_NAME,
    originPath: notFoundPath,
    component: notFoundRouteComponent,
    get layout() {
      return getRouteLayout(notFoundNode);
    },
    isBuiltin: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE,
  };

  return [rootNode, notFoundNode];
}

/**
 * filter conflict nodes
 * @descCN 过滤冲突节点
 * @param nodes nodes 节点列表
 */
function filterConflictNodes(nodes: AutoRouterNode[]) {
  const nodeMap = new Map<string, AutoRouterNode[]>();

  nodes.forEach((node) => {
    const items = nodeMap.get(node.name) ?? [];

    items.push(node);

    nodeMap.set(node.name, items);
  });

  const result: AutoRouterNode[] = [];

  const conflictNodes: AutoRouterNode[] = [];

  nodeMap.forEach((items) => {
    result.push(items[0]);

    if (items.length > 1) {
      conflictNodes.push(...items);
    }
  });

  if (conflictNodes.length > 0) {
    logger.warn(`${yellow('conflict routes, use the first one by default【路由冲突，默认取第一个】: ')}`);
    logger.table(
      conflictNodes.map((item) => ({
        name: item.name,
        fullPath: item.fullPath,
        glob: item.glob,
      }))
    );
  }

  return result;
}

/**
 * create empty reuse node
 * @descCN 创建空复用节点
 * @param path path 路径
 * @param options options 配置选项
 */
function createEmptyReuseNode(path: string, options: ParsedAutoRouterOptions) {
  const { getRouteName, getRoutePath, getRouteLayout } = options;

  let node: AutoRouterNode = {
    fullPath: path,
    name: '',
    originPath: path,
    component: '',
    get layout() {
      return getRouteLayout(node);
    },
    isReuse: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE,
  };

  node = transformParamNode(node);
  node.name = getRouteName(node);
  node.fullPath = getRoutePath(node);
  node.params = getParamsFromPath(node.fullPath);

  return node;
}

/**
 * resolve reuse nodes
 * @descCN 解析复用节点
 * @param options options 配置选项
 */
function resolveReuseNodes(options: ParsedAutoRouterOptions) {
  const { reuseRoutes, defaultReuseRouteComponent } = options;

  const nodes: AutoRouterNode[] = [];

  reuseRoutes.forEach((path) => {
    const node: AutoRouterNode = createEmptyReuseNode(path, options);
    node.component = defaultReuseRouteComponent;

    nodes.push(node);
  });

  return nodes;
}

/**
 * sort node name
 * @descCN 排序节点名称
 * @param preName 前一个节点名称
 * @param curName 当前节点名称
 */
export function sortNodeName(preName: string, curName: string) {
  if (preName === ROOT_ROUTE_NAME) {
    return -1;
  }

  if (curName === ROOT_ROUTE_NAME) {
    return 1;
  }

  if (preName === NOT_FOUND_ROUTE_NAME) {
    return -1;
  }

  if (curName === NOT_FOUND_ROUTE_NAME) {
    return 1;
  }

  return preName.localeCompare(curName);
}

/**
 * resolve nodes
 * @descCN 解析节点列表
 * @param globs globs 解析后的路径集合
 * @param options options 配置选项
 */
export function resolveNodes(globs: ResolvedGlob[], options: ParsedAutoRouterOptions) {
  const nodes = globs.map((glob) => resolveNode(glob, options));

  const builtinNodes = createBuiltinNode(options);
  const filteredNodes = filterConflictNodes(nodes);
  const reuseNodes = resolveReuseNodes(options);

  const result = [...builtinNodes, ...filteredNodes, ...reuseNodes];

  result.sort((preNode, curNode) => sortNodeName(preNode.name, curNode.name));

  return result;
}

/**
 * get node stat info
 * @descCN 获取节点统计信息
 * @param cwd project root path 项目根路径
 * @param nodes nodes 节点列表
 * @returns node stat info
 */
export async function getNodeStatInfo(cwd: string, nodes: AutoRouterNode[]) {
  const preStat = await getNodeBackup(cwd);
  const preStatInodes = new Set(Object.values(preStat).map((item) => item.inode));

  const info: NodeStatInfo = {
    add: [],
    rename: [],
  };

  nodes.forEach((node) => {
    const { name, inode } = node;

    if (inode === NO_FILE_INODE) return;

    const preInode = preStat[name];

    if (!preInode && !preStatInodes.has(inode)) {
      info.add.push(node);
      return;
    }

    if (preStatInodes.has(inode)) {
      const oldNodeName = Object.entries(preStat).find(([_, item]) => item.inode === inode)?.[0];

      if (oldNodeName && oldNodeName !== name) {
        info.rename.push({ ...node, oldNodeName });
      }
    }
  });

  return info;
}
