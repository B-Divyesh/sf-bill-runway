import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // The app shell is shared by real SPA routes such as /demo/. Public assets
  // must therefore stay root-relative instead of inheriting the current path.
  plugins: [viteSingleFile({ overrideConfig: { base: '/' } })],
  build: { target: 'es2022', sourcemap: true },
  server: { host: '127.0.0.1' }
});
