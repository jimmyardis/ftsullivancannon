import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Served from https://jimmyardis.github.io/ftsullivancannon/ on GitHub Pages,
  // so assets must be referenced relative to that subpath rather than the root.
  base: '/ftsullivancannon/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
