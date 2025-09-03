import { generateDtsFile } from './dts';
import { resolveGlobs } from './glob';
import { getNodeStatInfo, resolveNodes } from './node';
import { resolveOptions } from './options';
import { initTemp, isInExcludeGlob } from './temp';
import { FileWatcher } from './watcher';
import type { ViteDevServer } from 'vite';
import type {
  AutoRouterNode,
  NodeStatInfo,
  ParsedAutoRouterOptions,
  ResolvedGlob,
  RouterContextOptions,
} from '../types';

export class RouterContext {
  private options: ParsedAutoRouterOptions = {} as ParsedAutoRouterOptions;

  /**
   * the resolved globs
   * @descCN 解析后的 globs
   */
  globs: ResolvedGlob[] = [];

  /**
   * the nodes
   * @descCN 节点
   */
  nodes: AutoRouterNode[] = [];

  /**
   * the stat info
   * @descCN 统计信息
   */
  statInfo: NodeStatInfo = {
    add: [],
    rename: [],
  };

  /**
   * the watcher
   * @descCN 监听器
   */
  watcher?: FileWatcher;

  /**
   * the vite server
   * @descCN vite 服务器
   */
  viteServer?: ViteDevServer;

  constructor(rawOptions?: RouterContextOptions, generate = false) {
    this.init(rawOptions, generate);
  }

  /**
   * init
   * @descCN 初始化
   */
  init(options?: RouterContextOptions, generate = false) {
    this.options = resolveOptions(options);

    if (generate) {
      this.generate();
    }
  }

  /**
   * get options
   * @descCN 获取 options
   */
  getOptions() {
    return this.options;
  }

  /**
   * update options
   * @descCN 更新 options
   */
  updateOptions(options: Partial<ParsedAutoRouterOptions>) {
    this.options = Object.assign(this.options, options);
  }

  /**
   * init globs
   * @descCN 初始化 globs
   */
  async initGlobs() {
    this.globs = await resolveGlobs(this.options);
  }

  /**
   * init nodes
   * @descCN 初始化节点
   */
  async initNodes() {
    this.nodes = resolveNodes(this.globs, this.options);
  }

  /**
   * get configurable nodes
   * @descCN 获取可配置节点
   */
  getConfigurableNodes() {
    return this.nodes.filter((node) => !node.isBuiltin);
  }

  /**
   * init stat info
   * @descCN 初始化统计信息
   */
  async initStatInfo() {
    this.statInfo = await getNodeStatInfo(this.options.cwd, this.nodes);
  }

  /**
   * generate
   * @descCN 生成路由
   */
  async generate() {
    await initTemp(this.options.cwd);
    await this.initGlobs();
    await this.initNodes();
    await this.initStatInfo();

    await generateDtsFile(this.nodes, this.options);
  }

  /**
   * watch
   * @descCN 监听文件变化
   */
  async watch() {
    this.watcher = new FileWatcher(this.options);
    this.watcher?.start(async (glob) => {
      const isInExclude = await isInExcludeGlob(this.options.cwd, glob);

      if (isInExclude) return;

      await this.generate();
    });
  }

  /**
   * stop watch
   * @descCN 停止监听
   */
  stopWatch() {
    this.watcher?.close();
  }

  /**
   * set vite server
   * @descCN 设置 vite 服务器
   */
  setViteServer(server: ViteDevServer) {
    this.viteServer = server;

    this.viteServer.httpServer?.on('close', () => {
      this.stopWatch();
    });
  }

  /**
   * reload vite server
   * @descCN 重新加载 vite 服务器
   */
  reloadViteServer() {
    this.viteServer?.ws?.send({ type: 'full-reload', path: '*' });
  }
}
