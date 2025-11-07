/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Supabase compatibility with Edge Runtime
  experimental: {
    serverComponentsExternalPackages: [
      '@supabase/supabase-js',
      '@supabase/ssr',
    ],
  },
};

module.exports = nextConfig;
