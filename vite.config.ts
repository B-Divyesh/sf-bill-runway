import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: { target: 'es2022', sourcemap: true },
  server: { host: '127.0.0.1' }
});
