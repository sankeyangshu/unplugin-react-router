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
   * TODO: 参数可能要修改
   */
  routeLazyImport?: (routeName: string) => boolean;
  /**
   * whether to watch the file
   * @descCN 是否监听文件
   * @default true
   */
  watchFile?: boolean;
  /**
   * the duration of the file update
   * @descCN 文件更新时间
   * @default 500 ms
   */
  watchFileUpdateDuration?: number;
  /**
   * the root redirect path
   * @descCN 根路由重定向路径
   * @default '/home'
   */
  rootRedirect?: string;
  /**
   * the not found route component
   * @descCN 404 路由组件
   * @default '404'
   */
  notFoundRouteComponent?: string;
  /**
   * the routes to reuse
   * @descCN 复用已存在文件的路由
   * @example
   *   ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?'];
   */
  reuseRoutes?: string[];
  /**
   * the default component of the reuse route
   * @descCN 复用路由的默认组件
   * @default 'Wip'
   */
  defaultReuseRouteComponent?: string;
  /**
   * the path of the route
   * @descCN 路由路径
   * @default 'src/router/auto-router'
   */
  getRoutePath?: (node: AutoRouterNode) => string;
  /**
   * the name of the route
   * @descCN 路由名称
   * @default transform the path to the route name
   */
  getRouteName?: (node: AutoRouterNode) => string;
  /**
   * the layout of the route
   * @descCN 路由布局
   * @default get the first key of the layouts
   */
  getRouteLayout?: (node: AutoRouterNode) => string;
  /**
   * the function to generate the meta of the route
   * @descCN 生成路由的 handle 函数, 只会覆盖不存在的 handle 属性
   * @example
   *   ```ts
   *     getRouteHandle: (node) => {
   *       return {
   *         title: node.name
   *       }
   *     }
   *   ```;
   */
  getRouteHandle?: (node: AutoRouterNode) => Record<string, any> | null;
}

/**
 * unplugin options
 * @descCN unplugin 选项
 */
export type PluginOptions = Omit<RouterContextOptions, 'reuseRoutes'>;

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

/**
 * the resolved glob
 * @descCN 解析后的页面 glob
 */
export interface ResolvedGlob {
  /**
   * the page directory
   * @descCN 页面目录
   * @default pageDir
   */
  pageDir: string;
  /**
   * the glob of the pages
   * @descCN 页面 glob
   * @default '**‍/*.tsx'
   */
  glob: string;
  /**
   * the file path of the route
   * @descCN 路由文件路径
   */
  filePath: string;
  /**
   * the import path of the route
   * @descCN 路由导入路径
   */
  importPath: string;
  /**
   * the inode of the file
   * @descCN 文件唯一标识
   */
  inode: number;
}

/**
 * the type of the route param
 * @descCN 路由参数类型
 * - optional: the param is optional, [[id]] 可选参数
 * - required: the param is required, [id] 必选参数
 */
export type AutoRouterParamType = 'optional' | 'required';

/**
 * the auto router node
 * @descCN 自动路由节点
 */
export interface AutoRouterNode extends ResolvedGlob {
  /**
   * the path of the route
   * @descCN 路由路径
   * @default transform the glob to the path
   */
  fullPath: string;
  /**
   * the name of the route
   * @descCN 路由名称
   * @default transform the path to the route name
   */
  name: string;
  /**
   * the origin path of the route
   * @descCN 路由原始路径
   */
  originPath: string;
  /**
   * the component of the route
   * @descCN 路由组件
   */
  component: string;
  /**
   * the layout of the route
   * @descCN 路由布局
   * @default get the first key of the layouts
   */
  layout: string;
  /**
   * the group of the route
   * @descCN 路由组
   * @default ''
   */
  group?: string;
  /**
   * the params of the route
   * @descCN 路由参数
   */
  params?: Record<string, AutoRouterParamType>;
  /**
   * the import name of the route
   * @descCN 路由组件导入名称
   */
  importName: string;
  /**
   * the lazy of the route
   * @descCN 路由懒加载
   */
  isLazy?: boolean;
  /**
   * the builtin of the route. (Root, NotFound)
   * @descCN 内置路由 (Root, NotFound)
   */
  isBuiltin?: boolean;
  /**
   * the reuse of the route
   * @descCN 复用路由
   */
  isReuse?: boolean;
}

/**
 * the renamed node
 * @descCN 重命名节点
 */
interface RenamedNode extends AutoRouterNode {
  /**
   * the old node name
   * @descCN 旧节点名称
   */
  oldNodeName: string;
}

/**
 * the node stat info
 * @descCN 节点统计信息
 */
export interface NodeStatInfo {
  /**
   * the added nodes
   * @descCN 新增节点
   */
  add: AutoRouterNode[];
  /**
   * the renamed nodes
   * @descCN 重命名节点
   */
  rename: RenamedNode[];
}

/**
 * the node item backup
 * @descCN 节点备份
 */
export interface NodeItemBackup {
  /**
   * the filepath of the node
   * @descCN 节点文件路径
   */
  filepath: string;
  /**
   * the inode of the node
   * @descCN 节点唯一标识
   */
  inode: number;
}
