import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const adminDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: adminDirectory,
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
    allowedHosts: [".app.github.dev", "localhost"],
    proxy: {
      "/api": "http://localhost:3100",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(adminDirectory, "src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});