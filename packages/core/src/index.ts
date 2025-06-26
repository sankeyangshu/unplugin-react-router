import type { Plugin } from 'vite';

function VitePluginReactPages(): Plugin {
  return {
    name: 'vite-plugin-react-pages',
    enforce: 'pre',
    configResolved(config) {
      // eslint-disable-next-line no-console
      console.log(config);
    },
  };
}

export * from './types';

export default VitePluginReactPages;
