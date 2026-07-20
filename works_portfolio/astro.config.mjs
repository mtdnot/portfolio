import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/works',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
