import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 4000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./tests/component/setup.js'],
  },
});