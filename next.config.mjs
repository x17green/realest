/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE || 'full-site',
    NEXT_PUBLIC_RELEASE_DATE: process.env.NEXT_PUBLIC_RELEASE_DATE,
  },
}

export default nextConfig
