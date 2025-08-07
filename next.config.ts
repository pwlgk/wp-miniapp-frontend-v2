/** @type {import('next').NextConfig} */
const nextConfig = {
  // Добавляем эту секцию
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kosynkastore.ru',
        port: '',
        pathname: '/wp-content/uploads/**', // Уточняем путь для большей безопасности
      },
      {
        protocol: 'https',
        hostname: 't.me',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;