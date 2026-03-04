import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ctax-v3',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
