import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    dts(),
    visualizer({
      open: true,
      gzipSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Lens',
      fileName: (format) => `lens.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: true,
  },
});
