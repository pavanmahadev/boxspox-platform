import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required by @opennextjs/cloudflare to produce .next/standalone/
  compress: true, // Enables gzip compression
  // Exclude heavy packages from the Cloudflare Worker bundle.
  // These packages won't be available at runtime on Cloudflare Workers,
  // but excluding them is necessary to stay under the 3 MB Worker size limit.
  serverExternalPackages: [
    '@react-pdf/renderer',   // PDF engine (fontkit + harfbuzz + pdfkit) — ~8 MB alone
    'razorpay',              // Payment SDK with Node.js crypto internals
  ],
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
