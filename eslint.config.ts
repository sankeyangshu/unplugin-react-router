import { defineConfig } from '@sankeyangshu/eslint-config';

export default defineConfig(
  { react: true },
  {
    rules: {
      'perfectionist/sort-interfaces': 'off',
    },
  }
);
