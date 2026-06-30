import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // We run type checking separately via `tsc --noEmit`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
