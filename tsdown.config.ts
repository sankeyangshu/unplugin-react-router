import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  entry: ['./src/*.ts'],
  platform: 'node',
  shims: true,
});
