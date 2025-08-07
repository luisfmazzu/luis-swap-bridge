/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Simplified webpack config to avoid build issues
  webpack: (config, { isServer }) => {
    // Basic Web3 library imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Suppress pino-pretty warnings in production
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
      }
    }

    return config
  },
  
  // Add proper headers for Turnkey integration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ]
  },
  
  // Disable experimental features that might cause build issues
  // experimental: {
  //   optimizePackageImports: ['wagmi', '@tanstack/react-query', 'viem'],
  // },
  
  // // Transpile Web3 packages that might have issues
  // transpilePackages: ['@wagmi/core', '@wagmi/connectors'],
}

export default nextConfig
