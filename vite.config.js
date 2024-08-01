import { defineConfig } from "vite";

export default defineConfig({
     build: {
          lib: {
               entry: 'src/index.ts',
               name: 'three-query-selector',
               fileName: (format) => `three-query-selector.${format}.js`,
          },
     },
})