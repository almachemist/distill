import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;
