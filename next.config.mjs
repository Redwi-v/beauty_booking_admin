import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    //  TELEGRAM_APP_URL=https://t.me/beauty_booking123123_bot/beautyBooking
    // API_URL=https://api.mybeautybooking.ru


    //  DEV

    TELEGRAM_APP_URL: "https://t.me/beauty_booking_bot/beautyBooking",
    API_URL: "http://localhost:8888",
  },
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
