import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'va6iw0qi88gfmfrc.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
