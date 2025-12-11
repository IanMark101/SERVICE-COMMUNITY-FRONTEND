import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FRONTEND_URL: 'http://localhost:3000',
  },
  /* config options here */
};

export default nextConfig;
