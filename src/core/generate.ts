import { writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME } from '../constants';
import { createPrefixCommentOfGenFile, ensureFile } from '../utils';
import type { ParsedAutoRouterOptions } from '../types';

/**
 * get transformer code
 * @descCN 获取 transformer 代码
 */
function getTransformerCode() {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { RouteObject } from 'react-router';
import type {
  AutoRouterRedirect,
  AutoRouterRoute,
  AutoRouterView,
  RouteFileKey,
  RouteLayoutKey
} from '${UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME}';

function isAutoRouterRedirect(route: AutoRouterRoute): route is AutoRouterRedirect {
  return route?.index === true;
}

function getFormattedRoutes(routes: AutoRouterRoute[]) {
  const groupedRoutes = new Map<RouteLayoutKey, AutoRouterView[]>();
  const redirects: AutoRouterRedirect[] = [];

  routes.forEach(route => {
    if (isAutoRouterRedirect(route)) {
      redirects.push(route);
      return;
    }

    const items = groupedRoutes.get(route.layout) || [];
    items.push(route);
    groupedRoutes.set(route.layout, items);
  });

  return {
    redirects,
    groupedRoutes
  };
}

export function transformToReactRoutes(
  routes: AutoRouterRoute[],
  layouts: Record<RouteLayoutKey, () => Promise<any>>,
  pages: Record<RouteFileKey, () => Promise<any>>
) {
  const { redirects, groupedRoutes } = getFormattedRoutes(routes);

  const reactRoutes: RouteObject[] = [...redirects];

  // Convert route config, simplifying the logic for actions, loader, etc.
  function convertConfig(m: any) {
    const { action, loader, shouldRevalidate, default: Component } = m;
    return {
      action, // always use action
      loader, // always use loader
      shouldRevalidate,
      Component,
    };
  }

  groupedRoutes.forEach((items, layout) => {
    // 分离特殊路由和普通路由
    const specialRoutes: AutoRouterView[] = [];
    const normalRoutes: AutoRouterView[] = [];
    
    items.forEach(item => {
      // 通配符路由直接添加到根级别
      if (item.path === '*') {
        specialRoutes.push(item);
      } else {
        normalRoutes.push(item);
      }
    });
    
    // 特殊路由直接添加到根级别
    specialRoutes.forEach(item => {
      const { layout: _, component, ...rest } = item;
      reactRoutes.push({
        ...rest,
        lazy: async () => {
          const config = await pages[component]();
          return {
            ...convertConfig(config),
          };
        },
      });
    });
    
    // 普通路由作为布局的子路由
    if (normalRoutes.length > 0) {
      const layoutRoute: RouteObject = {
        path: '/',
        lazy: async () => {
          const config = await layouts[layout]();

          return {
            ...convertConfig(config),
          };
        },
        children: normalRoutes.map(item => {
          const { layout: _, component, path, ...rest } = item;
          
          // 将绝对路径转换为相对路径（去掉开头的/）
          const relativePath = path.startsWith('/') ? path.slice(1) : path;

          return {
            ...rest,
            path: relativePath,
            lazy: async () => {
              const config = await pages[component]();
              return {
                ...convertConfig(config),
              };
            },
          };
        })
      };

      reactRoutes.push(layoutRoute);
    }
  });

  return reactRoutes;
}
`;

  return code;
}

/**
 * generate transformer file
 * @descCN 生成 transformer 文件
 * @param options options 配置选项
 */
export async function generateTransformerFile(options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const transformerPath = posix.join(cwd, routerGeneratedDir, 'transformer.ts');

  await ensureFile(transformerPath);

  const code = getTransformerCode();

  await writeFile(transformerPath, code);
}
