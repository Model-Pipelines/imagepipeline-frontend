import type { NextConfig } from "next";
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';


const nextConfig: NextConfig = {
  // Disable TypeScript errors during the build process
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint errors during the build process
  eslint: {
    ignoreDuringBuilds: true,
  },
};
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;
