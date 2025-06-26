import reactPages from '@sankeyangshu/vite-plugin-react-pages';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reactPages()],
});
