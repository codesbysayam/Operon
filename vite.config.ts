import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: false, // Disables WebSocket HMR to prevent container iframe websocket connection rejections
  },

  preview: {
    port: 3000,
    host: '0.0.0.0',
  },

  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), '.'),
    },
    dedupe: ['react', 'react-dom'],
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
});


