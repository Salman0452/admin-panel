import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yhtoqgbsnwowiptysxec.supabase.co',
        pathname: '/storage/v1/object/public/products/images/**',
      },
    ],
  },
};

export default nextConfig;
