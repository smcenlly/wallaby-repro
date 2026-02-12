import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/test-app/vitest.config.ts',
      'libs/shared/ui/vitest.config.ts',
    ],
  },
});
