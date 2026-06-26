import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
  experimental: {
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
