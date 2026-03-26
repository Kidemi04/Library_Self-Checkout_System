import os from 'node:os';
import type { NextConfig } from 'next';

const isPrivateIpv4 = (value: string) => {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return false;

  const [first, second] = value.split('.').map((segment) => Number(segment));
  if ([first, second].some((segment) => Number.isNaN(segment))) return false;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

const collectAllowedDevOrigins = () => {
  const values = new Set<string>(['localhost', '127.0.0.1']);

  Object.values(os.networkInterfaces()).forEach((networkInterface) => {
    networkInterface?.forEach((address) => {
      if (!address || address.internal) return;

      const normalized = address.address.replace(/^::ffff:/, '').split('%')[0] ?? '';
      if (!normalized) return;

      if (address.family === 'IPv4' && isPrivateIpv4(normalized)) {
        values.add(normalized);
      }
    });
  });

  const extraOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  extraOrigins.forEach((origin) => values.add(origin));

  return Array.from(values);
};

const nextConfig: NextConfig = {
  allowedDevOrigins: collectAllowedDevOrigins(),
  turbopack: {
    root: process.cwd(),
  },
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
