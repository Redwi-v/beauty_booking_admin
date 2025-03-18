
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  env: {
    TELEGRAM_APP_URL: "https://t.me/beauty_booking123123_bot/beautyBooking",
    WEB_APP_URL: "https://client.mybeautybooking.ru",
    API_URL: "https://api.mybeautybooking.ru",

    // PHONE_CONFIRM_WIDGET_ID: "6RHyrL",
    // CAPTCHA_SITEKEY: "___________",

    //  DEV

    // TELEGRAM_APP_URL: "https://t.me/beauty_client_bot/beauty_client",
    // WEB_APP_URL: "https://clientbeauty.ru.tuna.am",
    // API_URL: "https://beauty-back.ru.tuna.am",

    PHONE_CONFIRM_WIDGET_ID: "R2shLA",
    CAPTCHA_SITEKEY: "2c8ef686-d204-4faa-b12c-823e55a8d4e8",
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
