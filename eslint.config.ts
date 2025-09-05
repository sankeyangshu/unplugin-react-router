import { defineConfig } from '@sankeyangshu/eslint-config';

export default defineConfig(
  { react: true },
  {
    rules: {
      '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
      'perfectionist/sort-interfaces': 'off',
    },
  }
);
