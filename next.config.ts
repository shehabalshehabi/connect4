import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.experiments = { asyncWebAssembly: true, topLevelAwait: true, layers:true };
    return config;
  },
};

export default nextConfig;
