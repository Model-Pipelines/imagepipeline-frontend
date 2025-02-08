import type { NextConfig } from "next";

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

export default nextConfig;
