import type { NextConfig } from "next";

// The app is served from https://<user>.github.io/antrenman/ (GitHub Pages project site).
const basePath = "/antrenman";

const nextConfig: NextConfig = {
  // No server: everything is prerendered to static files in `out/`.
  output: "export",
  basePath,
  // /history → /history/index.html, which is what a static host serves without rewrites.
  trailingSlash: true,
  // The default image optimizer needs a server; photos are already sized for the app.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
