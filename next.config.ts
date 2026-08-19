import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Workers deployment via @cloudflare/next-on-pages
  experimental: {
    // Enable Edge Runtime compatibility
  },
  images: {
    // Allow external images from CDN & Cloudflare R2
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.cbtrank.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
