import { createUnplugin, type UnpluginInstance } from 'unplugin';
import { RouterContext } from './core';
import type { PluginOptions } from './types';

export const Starter: UnpluginInstance<PluginOptions | undefined, false> = createUnplugin((rawOptions = {}) => {
  const autoRouter = new RouterContext(rawOptions);

  const autoRouterOptions = autoRouter.getOptions();

  return {
    name: 'unplugin-react-router',
    enforce: 'pre',
    vite: {
      apply: 'serve',
      async configureServer(server) {
        await autoRouter.generate();
        if (autoRouterOptions.watchFile) {
          autoRouter.watch();
        }

        autoRouter.setViteServer(server);
      },
    },
  };
});
