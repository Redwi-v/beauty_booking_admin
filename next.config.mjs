import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'https://encrypted-tbn0.gstatic.com'
      },

      {
        hostname: 'https://api.mybeautybooking.ru'
      }
    ]
  }
};

export default nextConfig;
