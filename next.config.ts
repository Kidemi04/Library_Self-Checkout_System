import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@xenova/transformers'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aadcdn.msauthimages.net',
      },
      {
        protocol: 'https',
        hostname: 'www.swinburne.edu.my',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'static.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
