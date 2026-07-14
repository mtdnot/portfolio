import { defineConfig } from 'astro/config';

const standalone = process.env.CYCLETREE_STANDALONE === '1';

export default defineConfig({
  base: standalone ? '/' : '/cycletree_portfolio',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
