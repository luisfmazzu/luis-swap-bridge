/**
 * API Endpoints Constants
 * Centralized configuration for all external API endpoints used throughout the application
 */

export const API_ENDPOINTS = {
  // TRON Network APIs
  TRON: {
    NILE_TESTNET: {
      TRONGRID_BASE: 'https://nile.trongrid.io',
      NILEEX_BASE: 'https://api.nileex.io',
      TRONSCAN_EXPLORER: 'https://nile.tronscan.org',
      // TronGrid v1 API endpoints
      ACCOUNTS: (address: string) => `https://nile.trongrid.io/v1/accounts/${address}`,
      TRANSACTIONS: (address: string) => `https://nile.trongrid.io/v1/accounts/${address}/transactions`,
      TRC20_TRANSACTIONS: (address: string) => `https://nile.trongrid.io/v1/accounts/${address}/transactions/trc20`,
      // Wallet API endpoints
      WALLET: {
        GET_ACCOUNT: 'https://nile.trongrid.io/wallet/getaccount',
        TRIGGER_CONSTANT_CONTRACT: 'https://nile.trongrid.io/wallet/triggerconstantcontract',
        VALIDATE_ADDRESS: 'https://nile.trongrid.io/wallet/validateaddress',
      },
      // Solidity endpoints
      SOLIDITY: {
        GET_ACCOUNT: 'https://nile.trongrid.io/walletsolidity/getaccount',
      }
    },
    MAINNET: {
      TRONGRID_BASE: 'https://api.trongrid.io',
      TRONSCAN_EXPLORER: 'https://tronscan.org',
    }
  },

  // Ethereum Network APIs
  ETHEREUM: {
    SEPOLIA_TESTNET: {
      ETHERSCAN_API: 'https://api-sepolia.etherscan.io/api',
      EXPLORER: 'https://sepolia.etherscan.io',
    },
    MAINNET: {
      ETHERSCAN_API: 'https://api.etherscan.io/api',
      EXPLORER: 'https://etherscan.io',
    }
  },

  // Celo Network APIs
  CELO: {
    ALFAJORES_TESTNET: {
      CELOSCAN_API: 'https://alfajores.celoscan.io/api',
      EXPLORER: 'https://alfajores.celoscan.io',
    },
    MAINNET: {
      CELOSCAN_API: 'https://celoscan.io/api',
      EXPLORER: 'https://celoscan.io',
    }
  }
} as const

/**
 * Contract Addresses for different networks
 */
export const CONTRACT_ADDRESSES = {
  TRON: {
    NILE_TESTNET: {
      USDT: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
      // Add more token contracts as needed
    }
  }
} as const

/**
 * Explorer URL builders
 */
export const EXPLORER_URLS = {
  TRANSACTION: {
    tron: (hash: string) => `${API_ENDPOINTS.TRON.NILE_TESTNET.TRONSCAN_EXPLORER}/#/transaction/${hash}`,
    ethereum: (hash: string) => `${API_ENDPOINTS.ETHEREUM.SEPOLIA_TESTNET.EXPLORER}/tx/${hash}`,
    celo: (hash: string) => `${API_ENDPOINTS.CELO.ALFAJORES_TESTNET.EXPLORER}/tx/${hash}`,
  },
  ADDRESS: {
    tron: (address: string) => `${API_ENDPOINTS.TRON.NILE_TESTNET.TRONSCAN_EXPLORER}/#/address/${address}`,
    ethereum: (address: string) => `${API_ENDPOINTS.ETHEREUM.SEPOLIA_TESTNET.EXPLORER}/address/${address}`,
    celo: (address: string) => `${API_ENDPOINTS.CELO.ALFAJORES_TESTNET.EXPLORER}/address/${address}`,
  }
} as const

/**
 * API Request configurations
 */
export const API_CONFIG = {
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
} as const