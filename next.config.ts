import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
