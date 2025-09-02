import { resolve } from 'node:path';
import process from 'node:process';
import { pascalCase } from 'scule';
import { normalizePath } from 'unplugin-utils';
import { getImportName, resolveAliasFromTsConfig, resolveImportPath, transformPathToName } from '../utils';
import type { ParsedAutoRouterOptions, RouterContextOptions } from '../types';

export function resolveOptions(options?: RouterContextOptions) {
  const cwd = process.cwd();

  const alias = resolveAliasFromTsConfig(cwd);

  const defaultOptions: Required<RouterContextOptions> = {
    cwd,
    pageDir: 'src/pages',
    pageInclude: ['**/*.tsx', '**/*.jsx'],
    pageExclude: ['**/components/**'],
    dts: 'src/types/elegant-router.d.ts',
    reactRouterDts: 'src/types/typed-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerGeneratedDir: 'src/router/_generated',
    layouts: {
      base: 'src/layouts/base/index.tsx',
      blank: 'src/layouts/blank/index.tsx',
    },
    layoutLazyImport: (_name) => true,
    routeLazyImport: (_name) => true, // TODO: 接下来的这几个可能需要优化待定
    watchFile: true,
    watchFileUpdateDuration: 500,
    rootRedirect: '/home',
    notFoundRouteComponent: '404',
    reuseRoutes: [],
    defaultReuseRouteComponent: 'Wip',
    getRoutePath: (node) => node.fullPath,
    getRouteName: (node) => transformPathToName(node.fullPath),
    getRouteLayout: () => Object.keys(defaultOptions.layouts)[0],
    getRouteHandle: () => null,
  };

  const { layouts, layoutLazyImport, ...restOptions } = Object.assign(defaultOptions, options);

  const pageInclude = Array.isArray(restOptions.pageInclude) ? restOptions.pageInclude : [restOptions.pageInclude];

  restOptions.cwd = normalizePath(restOptions.cwd);
  restOptions.defaultReuseRouteComponent = pascalCase(restOptions.defaultReuseRouteComponent);
  restOptions.notFoundRouteComponent = pascalCase(restOptions.notFoundRouteComponent);

  if (Object.keys(layouts).length === 0) {
    throw new Error('layouts is required');
  }

  restOptions.getRouteLayout = () => Object.keys(layouts)[0];

  const parsedOptions: ParsedAutoRouterOptions = {
    ...restOptions,
    pageExtension: pageInclude.map((item) => item.split('.').pop()!),
    layouts: Object.entries(layouts).map(([name, importPath]) => {
      let importName = getImportName(name);

      if (!importName.endsWith('Layout')) {
        importName = `${importName}Layout`;
      }

      const _path = resolve(cwd, importPath);
      const _importPath = normalizePath(resolveImportPath(_path, restOptions.alias));

      return {
        name,
        importPath: _importPath,
        importName,
        isLazy: layoutLazyImport(name),
      };
    }),
  };

  return parsedOptions;
}
