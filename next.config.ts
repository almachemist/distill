import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import withPWA from "next-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/app/api/calendar-data/**': ['data/**'],
    '/app/api/forecast/**': ['data/**'],
    '/app/api/production/old-roberta/**': ['src/modules/production/data/**', 'data/**'],
    '/app/api/production/rum/**': ['src/modules/production/data/**'],
    '/app/api/production/batches/**': ['src/modules/production/data/**'],
    '/app/api/calendar-events/**': ['data/**'],
    '/app/api/crm/**': ['data/**'],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: true,
  runtimeCaching: [
    {
      urlPattern: /^\/api\/calendar-data\/.*$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "calendar-data",
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:woff2?|ttf|otf)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts",
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
  ],
})(nextConfig);
