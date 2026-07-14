import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/u-aizu_portfolio',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
