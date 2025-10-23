import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  // Use relative paths for Electron compatibility
  base: "./",
  build: {
    // Ensure assets are referenced with relative paths
    assetsDir: "assets",
  },
  define: {
    // Ensure environment variables are available in production
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  envPrefix: ["VITE_"],
});
