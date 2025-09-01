import { resolveOptions } from './options';
import type { ParsedAutoRouterOptions, RouterContextOptions } from '../types';

export class RouterContext {
  private options: ParsedAutoRouterOptions = {} as ParsedAutoRouterOptions;

  constructor(rawOptions?: RouterContextOptions) {
    this.init(rawOptions);
  }

  /**
   * init
   * @descCN 初始化
   */
  init(options?: RouterContextOptions) {
    this.options = resolveOptions(options);
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
}
