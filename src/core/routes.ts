import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { IndentationText, Project, SyntaxKind } from 'ts-morph';
import { ROOT_ROUTE_NAME, UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME } from '../constants';
import {
  createPrefixCommentOfGenFile,
  ensureFile,
  getObjectProperty,
  getStringProperty,
  updateStringProperty,
} from '../utils';
import { sortNodeName } from './node';
import { getNodeBackupItem, updateRouteBackup } from './temp';
import type { ArrayLiteralExpression, Expression, SourceFile } from 'ts-morph';
import type { AutoRouterNode, NodeStatInfo, ParsedAutoRouterOptions, RouteBackup } from '../types';

/**
 * create init routes code
 * @descCN 创建初始路由代码
 * @returns code 写入文件的代码
 */
async function createInitRoutesCode() {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import { redirect } from 'react-router';
import type { AutoRouterRoute } from '${UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME}';

export const routes: AutoRouterRoute[] = [];
`;

  return code;
}

/**
 * get route source file
 * @descCN 获取路由源文件
 * @param routesPath routesPath 路由文件路径
 * @returns sourceFile 源文件
 */
async function getRouteSourceFile(routesPath: string) {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces, // 设置缩进为2个空格
      useTrailingCommas: false, // 不使用尾随逗号
    },
  });

  const sourceFile = project.addSourceFileAtPath(routesPath);

  function getRoutesExpression() {
    const routes = sourceFile.getVariableDeclaration('routes');

    const error = 'routes.ts content is not valid 【文件routes.ts内容不合法，请直接删除重新生成】';

    if (!routes) {
      throw new Error(error);
    }

    const initializer = routes.getInitializer();

    if (!initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      throw new Error(error);
    }

    return initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  }

  return {
    sourceFile,
    getRoutesExpression,
  };
}

function createHandleString(handle: Record<string, any>) {
  return `{
    ${Object.entries(handle)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(',\n')}
  }`;
}

function createRouteString(
  node: AutoRouterNode,
  rootRedirect?: string,
  getRouteHandle?: (node: AutoRouterNode) => Record<string, any> | null
) {
  let code = `{
    name: '${node.name}',
    path: '${node.fullPath}',`;

  if (node.name === ROOT_ROUTE_NAME && rootRedirect) {
    code += `\nindex: true,`;
    code += `\nloader: () => redirect('${rootRedirect}'),`;
  }

  if (node.layout) {
    code += `\nlayout: '${node.layout}',`;
  }

  if (node.component) {
    code += `\ncomponent: '${node.component}',`;
  }

  const handle = getRouteHandle?.(node);

  if (handle) {
    code += `\nhandle: ${createHandleString(handle)},`;
  }

  code += `\n}`;

  return code;
}

/**
 * create routes code by nodes
 * @descCN 根据节点创建路由代码
 * @param nodes nodes 节点
 * @param options options 配置选项
 * @returns code 路由代码
 */
async function createRoutesCodeByNodes(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { rootRedirect, getRouteHandle } = options;

  const code = `[\n${nodes.map((node) => createRouteString(node, rootRedirect, getRouteHandle)).join(',\n')}\n]`;

  return code;
}

function getRouteStringPropertyValue(element: Expression, propertyName: string) {
  const value = getStringProperty(element, propertyName);

  if (!value) return null;

  return value.getText().slice(1, value.getText().length - 1);
}

function sortElements(elements: Expression[]) {
  return elements.sort((pre, cur) => {
    const preName = getRouteStringPropertyValue(pre, 'name');
    const curName = getRouteStringPropertyValue(cur, 'name');

    if (preName && curName) {
      return sortNodeName(preName, curName);
    }

    return 0;
  });
}

function getRawCodeByElements(elements: Expression[]) {
  return elements.map((el) => el.getFullText()).join(',');
}

async function saveRouteSourceFile(sourceFile: SourceFile, routesExpression: ArrayLiteralExpression) {
  const sortedElements = sortElements(routesExpression.getElements());
  const code = getRawCodeByElements(sortedElements);

  routesExpression.replaceWithText(`[${code}\n]`);

  routesExpression.formatText({
    indentSize: 2,
  });

  await sourceFile.save();
}

/**
 * init routes
 * @descCN 初始化路由
 * @param nodes nodes 节点
 * @param routesPath routesPath 路由文件路径
 * @param options options 配置选项
 */
async function initRoutes(nodes: AutoRouterNode[], routesPath: string, options: ParsedAutoRouterOptions) {
  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const routesExpression = getRoutesExpression();

  const code = await createRoutesCodeByNodes(nodes, options);

  routesExpression.replaceWithText(code);

  await saveRouteSourceFile(sourceFile, routesExpression);
}

function getNamePathMap(elements: Expression[]) {
  const namePathMap = new Map<string, string>();

  elements.forEach((element) => {
    const routeName = getRouteStringPropertyValue(element, 'name');
    const routePath = getRouteStringPropertyValue(element, 'path');

    if (routeName && routePath) {
      namePathMap.set(routeName, routePath);
    }
  });

  return namePathMap;
}

function getRouteStatInfo(nodes: AutoRouterNode[], namePathMap: Map<string, string>, statInfo: NodeStatInfo) {
  const nameNodeMap = new Map<string, AutoRouterNode>();

  nodes.forEach((node) => {
    nameNodeMap.set(node.name, node);
  });

  const createdNames: string[] = [];
  const deletedNames: string[] = [];
  const updatedNames: { name: string; oldName: string }[] = [];

  statInfo.rename.forEach((rename) => {
    const node = nameNodeMap.get(rename.name);

    if (node) {
      updatedNames.push({ name: node.name, oldName: rename.oldNodeName });
    }
  });

  nameNodeMap.forEach((_node, name) => {
    if (!namePathMap.has(name) && !statInfo.rename.some((item) => item.name === name)) {
      createdNames.push(name);
    }
  });

  namePathMap.forEach((_path, name) => {
    if (!nameNodeMap.has(name) && !statInfo.rename.some((item) => item.oldNodeName === name)) {
      deletedNames.push(name);
    }
  });

  return {
    createdNames,
    deletedNames,
    updatedNames,
  };
}

function getRouteHandlePropertyValue(element: Expression) {
  const handle = getObjectProperty(element, 'handle');

  if (!handle) return null;

  return handle;
}

function updateHandleProperty(element: Expression, newHandle?: Record<string, any> | null) {
  if (!newHandle || Object.keys(newHandle).length === 0) return;
  if (!element.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  const handle = getRouteHandlePropertyValue(element);

  if (handle === null) {
    element.addPropertyAssignment({
      name: 'handle',
      initializer: createHandleString(newHandle),
    });

    return;
  }

  if (!handle.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  const keys = Object.keys(newHandle);

  keys.forEach((key) => {
    const value = getObjectProperty(handle, key);
    if (!value) {
      handle.addPropertyAssignment({
        name: key,
        initializer: JSON.stringify(newHandle[key]),
      });
    }
  });
}

async function updateRoutes(
  nodes: AutoRouterNode[],
  statInfo: NodeStatInfo,
  routesPath: string,
  options: ParsedAutoRouterOptions
) {
  const { cwd, getRouteHandle } = options;
  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const routesExpression = getRoutesExpression();

  const namePathMap = getNamePathMap(routesExpression.getElements());

  const { createdNames, deletedNames, updatedNames } = getRouteStatInfo(nodes, namePathMap, statInfo);

  if (createdNames.length > 0) {
    const createdRoutes = nodes.filter((node) => createdNames.includes(node.name));

    createdRoutes.forEach((node) => {
      const routeStr = createRouteString(node);

      routesExpression.addElement(routeStr);
    });
  }

  if (deletedNames.length > 0) {
    const routeBackup: RouteBackup = {};

    for await (const deletedName of deletedNames) {
      const elements = routesExpression.getElements();

      const index = elements.findIndex((el) => getRouteStringPropertyValue(el, 'name') === deletedName);

      if (index === -1) continue;

      const routeElement = elements[index];

      let routeText = routeElement.getFullText();

      routesExpression.removeElement(index);

      const nodeBackupItem = await getNodeBackupItem(cwd, deletedName);

      if (!nodeBackupItem) continue;

      if (routeText.startsWith('\n')) {
        routeText = routeText.slice(1);
      }
      routeBackup[deletedName] = {
        filepath: nodeBackupItem.filepath,
        routeCode: routeText,
      };
    }

    if (Object.keys(routeBackup).length > 0) {
      await updateRouteBackup(cwd, routeBackup);
    }
  }

  if (updatedNames.length > 0) {
    const updatedRoutes = nodes.filter((node) => {
      return updatedNames.some((item) => item.name === node.name);
    });

    updatedRoutes.forEach((node) => {
      const oldName = updatedNames.find((item) => item.name === node.name)?.oldName;

      const routeElement = routesExpression
        .getElements()
        .find((el) => getRouteStringPropertyValue(el, 'name') === oldName);

      if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

      // 更新路由名称
      updateStringProperty(routeElement, 'name', node.name);

      // 更新路由路径
      updateStringProperty(routeElement, 'path', node.fullPath);

      // 更新组件
      updateStringProperty(routeElement, 'component', node.component);

      // 更新布局
      updateStringProperty(routeElement, 'layout', node.layout);
    });
  }

  nodes.forEach((node) => {
    const routeElement = routesExpression
      .getElements()
      .find((el) => getRouteStringPropertyValue(el, 'name') === node.name);

    if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

    // 更新路由元信息
    updateHandleProperty(routeElement, getRouteHandle?.(node));
  });

  await saveRouteSourceFile(sourceFile, routesExpression);
}

/**
 * generate routes file
 * @descCN 生成路由文件
 * @param nodes nodes 节点
 * @param statInfo statInfo 统计信息
 * @param options options 配置选项
 */
export async function generateRoutesFile(
  nodes: AutoRouterNode[],
  statInfo: NodeStatInfo,
  options: ParsedAutoRouterOptions
) {
  const { cwd, routerGeneratedDir } = options;

  const routesFilePath = posix.join(cwd, routerGeneratedDir, 'routes.ts');

  await ensureFile(routesFilePath);

  if (!existsSync(routesFilePath)) {
    const code = await createInitRoutesCode();

    await writeFile(routesFilePath, code);

    await initRoutes(nodes, routesFilePath, options);

    return;
  }

  await updateRoutes(nodes, statInfo, routesFilePath, options);
}
