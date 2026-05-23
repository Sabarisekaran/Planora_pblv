import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  // API Proxy Target for local development
  // Priority: Explicit VITE_API_PROXY_TARGET > fallback to localhost:5000
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5000";
  const normalizedProxyTarget = apiProxyTarget.replace(/\/api\/?$/, "");
  
  console.log("🔧 Vite Config - API Proxy Target:", normalizedProxyTarget);
  console.log("   Frontend API calls will use: /api (relative)");
  console.log("   Vite will proxy /api → " + normalizedProxyTarget);

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        "subsector-surcharge-pueblo.ngrok-free.dev",
      ],
      proxy: {
        "/api": {
          target: normalizedProxyTarget,
          changeOrigin: true,
          secure: false,
          headers: normalizedProxyTarget.includes("ngrok")
            ? {
                "ngrok-skip-browser-warning": "true",
              }
            : undefined,
        },
        "/uploads": {
          target: normalizedProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
