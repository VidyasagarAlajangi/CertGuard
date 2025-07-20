import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000/", // 👈 your backend port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // optional, clarifies intent
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
