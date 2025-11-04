/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['http://swin-lib.local:3000'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.swinburne.edu.my',
      },
      {
        protocol: 'https',
        hostname: 'aadcdn.msauthimages.net',
      },
    ],
  },
};

export default nextConfig;
