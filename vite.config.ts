import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  // support importing .jpg/.jpeg/.png/.svg as assets (with ?url)
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg'],
  plugins: [react(), dts()],
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
