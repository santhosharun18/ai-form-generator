/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ WARNING: Only for deployment fix, remove after fixing TS errors
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

module.exports = nextConfig
