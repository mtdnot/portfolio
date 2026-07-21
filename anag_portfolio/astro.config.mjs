// @ts-check
import { defineConfig } from 'astro/config';

const standalone = process.env.STANDALONE === '1';

export default defineConfig({
  output: 'static',
  base: standalone ? '/' : '/anag',
});
