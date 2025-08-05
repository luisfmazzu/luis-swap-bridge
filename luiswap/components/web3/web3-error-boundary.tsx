'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Web3ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface Web3ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class Web3ErrorBoundary extends Component<Web3ErrorBoundaryProps, Web3ErrorBoundaryState> {
  constructor(props: Web3ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Web3ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out non-critical WalletConnect errors
    if (error.message?.includes('Connection interrupted while trying to subscribe') ||
        error.message?.includes('Failed to fetch remote project configuration') ||
        error.message?.includes('HTTP status code: 403')) {
      console.debug('Non-critical Web3 error caught by boundary:', error.message)
      // Reset the error state for non-critical errors
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
      return
    }

    console.error('Web3 Error Boundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    // Force a page reload to reset Web3 connections
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-foreground">Web3 Connection Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                There was an issue connecting to the Web3 provider. This might be due to:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Network connectivity issues</li>
                <li>Wallet connection problems</li>
                <li>Browser extension conflicts</li>
                <li>RPC endpoint issues</li>
              </ul>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  size="sm"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component wrapper for easier usage
export function withWeb3ErrorBoundary<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <Web3ErrorBoundary>
        <Component {...props} />
      </Web3ErrorBoundary>
    )
  }
}