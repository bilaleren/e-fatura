import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/dist', 'typings'],
      extension: ['.ts'],
      provider: 'v8'
    }
  }
});
