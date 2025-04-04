import type { NextConfig } from "next";
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // compiler: {
  //   removeConsole: true
  // }
};

export default async function getNextConfig() {
  if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform();
  }
  return nextConfig;
}
