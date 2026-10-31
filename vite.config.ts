import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import componentTagger from "./plugins/component-tagger";

/** Social crawlers need absolute image URLs: VITE_SITE_URL, else Vercel's production domain, else relative. */
function siteUrl(env: Record<string, string | undefined>) {
  const raw = env.VITE_SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return raw.replace(/\/+$/, "");
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    hmr: {
      overlay: false,
      timeout: 15000,
    },
    watch: {
      usePolling: true,
      interval: 500,
      binaryInterval: 500,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "pack-site-url",
      transformIndexHtml: (html: string) => html.replaceAll("__SITE_URL__", siteUrl(process.env)),
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
