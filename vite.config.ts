
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Increase limit to 1000kb as a baseline for feature-rich fintech apps
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Strategic chunk splitting for better caching and smaller entry points
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split heavy-weight libraries into dedicated vendor chunks
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('@google/genai')) return 'vendor-gemini';
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            // General dependencies chunk
            return 'vendor-core';
          }
        },
      },
    },
  },
});
