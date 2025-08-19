import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { tsImport } from 'tsx/esm/api';
import { defineConfig } from 'vite';

const ReactRouter = (await tsImport('unplugin-react-router/vite', import.meta.url)).default;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ReactRouter()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~root': import.meta.dirname,
    },
  },
});
