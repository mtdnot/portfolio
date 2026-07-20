import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/u-aizu',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
