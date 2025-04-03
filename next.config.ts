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
};

export default async function getNextConfig() {
  if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform();
  }

  if (process.env.NODE_ENV === 'production') {
    disableConsoleLogs();
  }

  return nextConfig;
}

function disableConsoleLogs() {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};
}
