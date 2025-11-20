import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Habilitar standalone output para Docker
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
