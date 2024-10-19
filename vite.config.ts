import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@components': path.resolve(__dirname, './src/components')
    },
  },
  build: {
    outDir: 'dist',  // Output directory for Vite builds
    emptyOutDir: true,  // Clean the output directory before each build
  },
});
