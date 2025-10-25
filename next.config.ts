import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'va6iw0qi88gfmfrc.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'placekeanu.com',
      },
      
    ],
  },
};

export default nextConfig;
