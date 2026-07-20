import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/tech',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
