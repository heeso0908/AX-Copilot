import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};

export default nextConfig;
