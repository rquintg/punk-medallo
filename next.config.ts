import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/contacto",
        permanent: true,
      },
    ];
  },
  images: {
    deviceSizes: [640, 750, 1080],
    imageSizes: [128, 256, 512],
    formats: ["image/webp"],
    qualities: [60, 75],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/productos/**",
      },
    ],
  },
};

export default nextConfig;
