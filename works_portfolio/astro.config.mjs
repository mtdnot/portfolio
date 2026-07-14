import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/works_portfolio',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
