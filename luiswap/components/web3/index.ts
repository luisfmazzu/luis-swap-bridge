// Web3 Client Components with SSR protection
export { ClientWrapper } from './client-wrapper'
export { ConnectionManager } from './connection-manager'
export { Web3Status } from './web3-status'
export { Web3ErrorBoundary, withWeb3ErrorBoundary } from './web3-error-boundary'

// Dynamic imports for heavy Web3 components
export { DynamicSwapInterface } from './dynamic-swap-interface'
export { DynamicBridgeInterface } from './dynamic-bridge-interface'
export { DynamicPortfolioOverview } from './dynamic-portfolio-overview'