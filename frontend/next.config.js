// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://finance-tracker-rbac.vercel.app/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig