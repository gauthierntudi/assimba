import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { asSimbaPwaPlugin } from './vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), asSimbaPwaPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
