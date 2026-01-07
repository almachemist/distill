import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
// PWA disabled due to build/runtime errors with Next 15

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
  },
};

export default nextConfig;
