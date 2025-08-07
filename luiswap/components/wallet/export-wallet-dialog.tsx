'use client'

import { useEffect, useRef, useState } from 'react'
import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAuth } from '@/contexts/auth-provider'
import { type TurnkeyIframeClient } from '@turnkey/sdk-browser'
import { Key, Loader, RectangleEllipsis, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

interface ExportWalletDialogProps {
  children?: React.ReactNode
  selectedNetwork?: 'tron' | 'ethereum'
}

export function ExportWalletDialog({ children, selectedNetwork }: ExportWalletDialogProps) {
  const { selectedWallet, selectedAccount } = useTurnkeyWallet(selectedNetwork)
  const { turnkey, indexedDbClient } = useTurnkey()
  const { user } = useAuth()
  
  const [iframeClient, setIframeClient] = useState<TurnkeyIframeClient | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const iframeContainerRef = useRef<HTMLDivElement | null>(null)
  const [injectResponse, setInjectResponse] = useState(false)
  const [selectedExportType, setSelectedExportType] = useState('seed-phrase')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Iframe configuration - using demo project's URLs as base
  const iframeUrl = 'https://export.turnkey.com'

  useEffect(() => {
    if (isDialogOpen && turnkey) {
      const initIframe = async () => {
        if (iframeContainerRef.current) {
          try {
            const iframeContainer = iframeContainerRef.current
            const exportIframeClient = await turnkey?.iframeClient({
              iframeContainer,
              iframeUrl,
            })
            if (exportIframeClient) {
              setIframeClient(exportIframeClient)
            }
          } catch (error) {
            console.error('Failed to initialize iframe:', error)
            setError('Failed to initialize secure export interface')
          }
        }
      }

      const observer = new MutationObserver(() => {
        if (iframeContainerRef.current) {
          initIframe()
          observer.disconnect()
        }
      })

      if (!iframeContainerRef.current) {
        observer.observe(document.body, { childList: true, subtree: true })
      }

      return () => observer.disconnect()
    }
  }, [isDialogOpen, turnkey])

  const exportWallet = async () => {
    setError(null)
    
    // If we've already exported the wallet, close the dialog
    if (injectResponse) {
      setIsDialogOpen(false)
      setInjectResponse(false)
      return
    }

    try {
      setLoading(true)
      if (iframeClient && selectedWallet) {
        if (selectedExportType === 'seed-phrase') {
          await exportSeedPhrase()
        } else if (selectedExportType === 'private-key') {
          await exportPrivateKey()
        }
      }
    } catch (error) {
      displayError(error)
    } finally {
      setLoading(false)
    }
  }

  const exportSeedPhrase = async () => {
    if (iframeClient && selectedWallet && indexedDbClient) {
      try {
        const exportResponse = await indexedDbClient.exportWallet({
          walletId: selectedWallet.walletId,
          targetPublicKey: iframeClient.iframePublicKey || '',
        })

        if (exportResponse?.exportBundle) {
          const session = await turnkey?.getSession()
          const response = await iframeClient.injectWalletExportBundle(
            exportResponse.exportBundle,
            session?.organizationId || ''
          )

          setInjectResponse(response || false)
        }
      } catch (error) {
        displayError(error)
      }
    }
  }

  const exportPrivateKey = async () => {
    if (iframeClient && selectedAccount && indexedDbClient) {
      try {
        const exportResponse = await indexedDbClient.exportWalletAccount({
          address: selectedAccount.address,
          targetPublicKey: iframeClient.iframePublicKey || '',
        })
        
        if (exportResponse?.exportBundle) {
          const session = await turnkey?.getSession()
          const response = await iframeClient.injectKeyExportBundle(
            exportResponse.exportBundle,
            session?.organizationId || ''
          )

          setInjectResponse(response || false)
        }
      } catch (error) {
        displayError(error)
      }
    }
  }

  const displayError = (error: any) => {
    if (error?.message?.includes('webauthn authenticator not found in organization')) {
      setError('Unauthorized: Authenticator not found, please try again.')
    } else if (error?.message?.includes('not authorized to export')) {
      setError('Not authorized to export wallet. Check your permissions.')
    } else {
      console.error('Export error:', error)
      setError('Export failed. Please try again.')
    }
  }

  const resetState = () => {
    setInjectResponse(false)
    setSelectedExportType('seed-phrase')
    setError(null)
  }

  useEffect(() => {
    if (!isDialogOpen) {
      resetState()
    }
  }, [isDialogOpen])

  if (!user) return null

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {injectResponse
              ? `Your ${selectedExportType === 'seed-phrase' ? 'seed phrase' : 'private key'}`
              : 'Export Wallet'}
          </DialogTitle>
          <DialogDescription>
            {injectResponse
              ? `Do not share your ${selectedExportType === 'seed-phrase' ? 'seed phrase' : 'private key'} with anyone.`
              : 'Select what you want to export'}
          </DialogDescription>
        </DialogHeader>
        
        {!injectResponse && (
          <div className="py-4">
            <RadioGroup
              value={selectedExportType}
              onValueChange={setSelectedExportType}
              className="flex gap-4"
            >
              <div className="flex-1">
                <RadioGroupItem
                  value="seed-phrase"
                  id="seed-phrase"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="seed-phrase"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <RectangleEllipsis className="mb-2 h-6 w-6" />
                  Seed Phrase
                </Label>
              </div>
              <div className="flex-1">
                <RadioGroupItem
                  value="private-key"
                  id="private-key"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="private-key"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Key className="mb-2 h-6 w-6" />
                  Private Key
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <div
          className={cn('w-full rounded-md bg-muted p-4', {
            hidden: !injectResponse,
          })}
        >
          <div ref={iframeContainerRef} className="h-40 w-full" />
        </div>
        
        <DialogFooter className="w-full">
          <div className="flex w-full flex-col gap-2">
            <div
              className={cn('ml-1 text-xs font-medium text-destructive', {
                hidden: !error,
              })}
            >
              {error}
            </div>
            <Button
              disabled={loading || (!selectedWallet && !selectedAccount)}
              onClick={exportWallet}
              type="submit"
              className="w-full"
            >
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {injectResponse ? 'Done' : 'Export'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}