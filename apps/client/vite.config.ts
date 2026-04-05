import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyTarget = process.env.VITE_PROXY_TARGET ?? "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/shipment": proxyTarget
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts"
  }
});
