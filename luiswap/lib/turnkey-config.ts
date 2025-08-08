export const turnkeyConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL || 'https://api.turnkey.com',
  organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID || '',
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
    rpId: process.env.NEXT_PUBLIC_TURNKEY_RP_ID || "localhost",
  },
  rpcUrl: process.env.ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : '',
}