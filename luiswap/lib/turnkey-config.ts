// Environment variables with fallbacks to match demo pattern
const NEXT_PUBLIC_TURNKEY_API_BASE_URL = process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL || 'https://api.turnkey.com'
const NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID = process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID || ''
const NEXT_PUBLIC_TURNKEY_RP_ID = process.env.NEXT_PUBLIC_TURNKEY_RP_ID || "localhost"
const NEXT_PUBLIC_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''

// Log configuration values for debugging
console.log('🔧 TurnkeyConfig: Environment values loaded:')
console.log('📊 NEXT_PUBLIC_TURNKEY_API_BASE_URL:', NEXT_PUBLIC_TURNKEY_API_BASE_URL)
console.log('🏢 NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID:', NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID)
console.log('🔑 NEXT_PUBLIC_TURNKEY_RP_ID:', NEXT_PUBLIC_TURNKEY_RP_ID)
console.log('🌐 NEXT_PUBLIC_ALCHEMY_API_KEY exists:', !!NEXT_PUBLIC_ALCHEMY_API_KEY)

export const turnkeyConfig = {
  // Use API base URL as both base URL and organizationId endpoint
  apiBaseUrl: NEXT_PUBLIC_TURNKEY_API_BASE_URL,
  organizationId: NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID,
  iFrame: {
    // default
    url: process.env.NEXT_PUBLIC_TURNKEY_AUTH_IFRAME_URL || "https://auth.turnkey.com",
    elementId: "turnkey-auth-iframe-element-id",
    containerId: "turnkey-auth-iframe-container-id",
    auth: {
      url: process.env.NEXT_PUBLIC_TURNKEY_AUTH_IFRAME_URL || "https://auth.turnkey.com",
      containerId: "turnkey-auth-iframe-container-id",
    },
    export: {
      url: process.env.NEXT_PUBLIC_TURNKEY_EXPORT_IFRAME_URL || "https://export.turnkey.com",
      containerId: "turnkey-export-iframe-container-id",
    },
    import: {
      url: process.env.NEXT_PUBLIC_TURNKEY_IMPORT_IFRAME_URL || "https://import.turnkey.com",
      containerId: "turnkey-import-iframe-container-id",
    },
  },
  passkey: {
    rpId: NEXT_PUBLIC_TURNKEY_RP_ID,
  },
  rpcUrl: NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${NEXT_PUBLIC_ALCHEMY_API_KEY}` : '',
}