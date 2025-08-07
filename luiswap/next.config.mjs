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
  
  // Optimize Web3 libraries for better tree shaking and dynamic imports
  webpack: (config, { isServer }) => {
    // Optimize Web3 library imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Optimize wagmi and Web3 related packages
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate Web3 libraries into their own chunk
          web3: {
            test: /[\\/]node_modules[\\/](wagmi|@wagmi|@tanstack\/react-query|viem|@walletconnect|@reown)[\\/]/,
            name: 'web3',
            chunks: 'all',
            priority: 10,
          },
          // Separate wallet connectors
          wallets: {
            test: /[\\/]node_modules[\\/](@metamask|@coinbase|@walletconnect\/ethereum-provider)[\\/]/,
            name: 'wallets',
            chunks: 'async',
            priority: 15,
          },
        },
      },
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
  
  // Experimental features for better Web3 support
  experimental: {
    optimizePackageImports: ['wagmi', '@tanstack/react-query', 'viem'],
  },
  
  // Transpile Web3 packages that might have issues
  transpilePackages: ['@wagmi/core', '@wagmi/connectors'],
}

export default nextConfig
