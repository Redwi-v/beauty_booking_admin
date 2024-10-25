
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TELEGRAM_APP_URL: "https://client.mybeautybooking.ru",
    API_URL: "https://api.mybeautybooking.ru",

    //  DEV

    // TELEGRAM_APP_URL: "http://localhost:3002",
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
