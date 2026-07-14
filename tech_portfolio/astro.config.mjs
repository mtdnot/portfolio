import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/tech_portfolio',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
