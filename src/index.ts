import { createUnplugin, type UnpluginInstance } from 'unplugin';
import { createFilter } from 'unplugin-utils';
import { resolveOptions, type Options } from './core/options';

export const Starter: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (rawOptions = {}) => {
    const options = resolveOptions(rawOptions);
    const filter = createFilter(options.include, options.exclude);

    const name = 'unplugin-react-router';
    return {
      name,
      enforce: options.enforce,

      transformInclude(id) {
        return filter(id);
      },

      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
      transform(code, id) {
        return `// unplugin-react-router injected\n${code}`;
      },
    };
  }
);
