import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      name: 'Lens',               // global variable for UMD
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js';
        if (format === 'cjs') return 'index.cjs.js';
        if (format === 'umd') return 'index.umd.js';
        return `index.${format}.js`;
      }
    },
    rollupOptions: {
      // mark peerDependencies as externals
      external: [...Object.keys(pkg.peerDependencies)],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  plugins: [
    react(),
    dts({
      outDir: 'dist',
      insertTypesEntry: true,
      // respectExternal: true
    })
  ],
  resolve: {
    // if you have path aliases in tsconfig, mirror them here:
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
});
