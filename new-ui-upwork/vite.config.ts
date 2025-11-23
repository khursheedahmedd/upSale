import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Ensure base path is set for SPA routing
  publicDir: 'public', // Explicitly define public directory
  server: {
    host: "::", 
    port: 5003
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
