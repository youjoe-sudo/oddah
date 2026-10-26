import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    // قاعدة بيانات الاختبار معزولة — لا نشغّل اختبارات قاعدة مع التطبيق
    exclude: ['**/node_modules/**', '**/.next/**', 'e2e/**'],
  },
});
