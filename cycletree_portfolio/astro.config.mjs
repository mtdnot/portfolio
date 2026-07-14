import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/cycletree_portfolio',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
