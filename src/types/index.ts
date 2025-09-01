/**
 * router context options
 * @descCN 路由上下文选项
 */
export interface RouterContextOptions {
  /**
   * Root of the project. All paths are resolved relatively to this one.
   * @descCN 项目根目录
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * the directory of the pages
   * @descCN 页面目录
   * @default 'src/pages'
   */
  pageDir?: string | string[];
  /**
   * the glob of the pages
   * @descCN 页面 glob
   * @default ['.jsx','.tsx']
   */
  pageInclude?: string | string[];
  /**
   * the glob of the pages to exclude
   * @descCN 页面 glob 排除
   * @default ['**‍/components/**']
   */
  pageExclude?: string | string[];
  /**
   * the path of the dts file
   * @descCN 生成的路由类型声明文件路径
   * @default 'src/types/elegant-router.d.ts'
   */
  dts?: string;
  /**
   * the path of the react-router dts file
   * TODO: 名称待定
   * @descCN react-router 类型声明文件路径
   * @default 'src/types/typed-router.d.ts'
   */
  reactRouterDts?: string;
  /**
   * the path of the tsconfig file
   * @descCN tsconfig 文件路径
   * @default 'tsconfig.json'
   */
  tsconfig?: string;
  /**
   * the alias of the project
   * @descCN 项目别名
   * @default 'get the alias from the tsconfig'
   */
  alias?: Record<string, string>;
  /**
   * the directory of the router generated
   * @descCN 路由自动生成的目录
   * @default 'src/router/_generated'
   */
  routerGeneratedDir?: string;
  /**
   * the layouts of the router
   * @descCN 路由布局
   * @default "{
   *  base: 'src/layouts/base/index.tsx',
   *  blank: 'src/layouts/blank/index.tsx',
   * }"
   */
  layouts?: Record<string, string>;
  /**
   * the lazy of the layout
   * @descCN 布局懒加载
   * @default _name => false
   * @param layoutName the layout name
   */
  layoutLazyImport?: (layoutName: string) => boolean;
  /**
   * whether the route is lazy import
   * @descCN 路由懒加载
   * @example
   *   - the direct import
   *   ```ts
   *   import Home from './pages/home/index.tsx';
   *   ```
   *   - the lazy import
   *   ```ts
   *   const Home = import('./pages/home/index.tsx');
   *   ```
   * @default _name => true
   * @param routeName route name
   */
  lazyImport?: (routeName: string) => boolean;
}

/**
 * unplugin options
 * @descCN unplugin 选项
 * TODO: 待实现移除复用路由的选项
 */
export type PluginOptions = RouterContextOptions;

/**
 * the normalized layout
 * @descCN 标准化布局
 */
export interface NormalizedLayout {
  /**
   * the name of the layout
   * @descCN 布局名称
   */
  name: string;
  /**
   * the import name of the layout
   * @descCN 布局组件导入名称
   */
  importName: string;
  /**
   * the import path of the layout
   * @descCN 布局导入路径
   */
  importPath: string;
  /**
   * the lazy of the layout
   * @descCN 布局懒加载
   */
  isLazy: boolean;
}

/**
 * the parsed auto router options
 * @descCN 解析后的自动路由选项
 */
export type ParsedAutoRouterOptions = Omit<Required<RouterContextOptions>, 'layoutLazyImport' | 'layouts'> & {
  layouts: NormalizedLayout[];
  pageExtension: string[];
};
