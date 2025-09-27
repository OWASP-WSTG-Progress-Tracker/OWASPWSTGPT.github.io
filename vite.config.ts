import { defineConfig } from "vite";
// Use dynamic import for plugin-react to avoid ESM issues in Vercel
import path from "path";

export default defineConfig(async ({ mode }) => {
  const react = (await import("@vitejs/plugin-react")).default;
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});