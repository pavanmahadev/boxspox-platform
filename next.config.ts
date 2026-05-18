import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Enables gzip compression
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow external images from anywhere (since logos/assets are hosted externally)
      },
    ],
  },
};

export default nextConfig;
