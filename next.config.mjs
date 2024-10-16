
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TELEGRAM_APP_URL: "https://t.me/beauty_booking123123_bot/beautyBooking",
    API_URL: "https://api.mybeautybooking.ru",

    //  DEV

    // TELEGRAM_APP_URL: "https://t.me/beauty_client_bot/beauty_client",
    // API_URL: "http://localhost:8888",
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
        protocol: 'https',
        hostname: 'api.mybeautybooking.ru'
      }
    ]
  }
};

export default nextConfig;
