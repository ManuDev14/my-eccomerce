/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización para evitar errores de stack overflow en Vercel
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": [],
    },
    outputFileTracingExcludes: {
      "*": [
        "node_modules/@swc/core-linux-x64-gnu",
        "node_modules/@swc/core-linux-x64-musl",
        "node_modules/@esbuild/linux-x64",
      ],
    },
  },

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
