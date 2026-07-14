import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/personal_portfolio',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
