import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs as a separate step — don't block production builds with lint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
