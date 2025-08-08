'use client'

import { useEffect, useRef, useState } from 'react'
import { useUnifiedTurnkey } from '@/hooks/use-unified-turnkey'
import { useAuth } from '@/contexts/auth-provider'
import { type TurnkeyIframeClient, DEFAULT_ETHEREUM_ACCOUNTS, DEFAULT_TRON_ACCOUNTS } from '@turnkey/sdk-browser'
import { Info, Key, Loader, RectangleEllipsis, Download } from 'lucide-react'
import { toast } from 'sonner'

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
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ImportWalletDialogProps {
  children?: React.ReactNode
  selectedNetwork?: 'tron' | 'ethereum'
}

export function ImportWalletDialog({ children, selectedNetwork }: ImportWalletDialogProps) {
  const { turnkey, indexedDbClient } = useUnifiedTurnkey()
  const { user } = useAuth()
  
  const [iframeClient, setIframeClient] = useState<TurnkeyIframeClient | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const iframeContainerRef = useRef<HTMLDivElement | null>(null)
  const [injectResponse, setInjectResponse] = useState(false)
  const [selectedImportType, setSelectedImportType] = useState('seed-phrase')
  const [loading, setLoading] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [importName, setImportName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Iframe configuration - using demo project's URLs as base
  const iframeUrl = 'https://auth.turnkey.com'

  useEffect(() => {
    if (isDialogOpen && turnkey) {
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

  const resetState = () => {
    setSelectedImportType('seed-phrase')
    setImportComplete(false)
    setInjectResponse(false)
    setImportName('')
    setError(null)
    setLoading(false)
  }

  const initIframe = async () => {
    if (iframeContainerRef.current) {
      try {
        const iframeContainer = iframeContainerRef.current
        const importIframeClient = await turnkey?.iframeClient({
          iframeContainer,
          iframeUrl,
        })
        if (importIframeClient) {
          setIframeClient(importIframeClient)
        }
      } catch (error) {
        console.error('Failed to initialize iframe:', error)
        setError('Failed to initialize secure import interface')
      }
    }
  }

  const initImportWallet = async () => {
    const session = await turnkey?.getSession()
    if (!session?.userId) {
      setError('User session not found')
      return
    }

    try {
      const initImportResponse = await indexedDbClient?.initImportWallet({
        userId: session.userId,
      })

      if (initImportResponse?.importBundle && iframeClient) {
        const injectResponse = await iframeClient.injectImportBundle(
          initImportResponse.importBundle,
          session.organizationId || '',
          session.userId
        )

        if (injectResponse) {
          setInjectResponse(true)
        }
      }
    } catch (error) {
      displayError(error)
    }
  }

  const importWallet = async () => {
    const session = await turnkey?.getSession()
    if (!session?.userId) {
      setError('User session not found')
      return
    }

    try {
      const encryptedBundle = await iframeClient?.extractWalletEncryptedBundle()

      if (encryptedBundle) {
        // Use both TRON and Ethereum accounts for multi-chain support
        const accounts = [...DEFAULT_TRON_ACCOUNTS, ...DEFAULT_ETHEREUM_ACCOUNTS]
        
        const importResponse = await indexedDbClient?.importWallet({
          userId: session.userId,
          walletName: importName,
          encryptedBundle,
          accounts,
        })

        if (importResponse) {
          setImportComplete(true)
        }
      }
    } catch (error) {
      displayError(error)
    }
  }

  const initImportPrivateKey = async () => {
    const session = await turnkey?.getSession()
    if (!session?.userId) {
      setError('User session not found')
      return
    }

    try {
      const initImportResponse = await indexedDbClient?.initImportPrivateKey({
        userId: session.userId,
      })

      if (initImportResponse?.importBundle && iframeClient) {
        const injectResponse = await iframeClient.injectImportBundle(
          initImportResponse.importBundle,
          session.organizationId || '',
          session.userId
        )

        if (injectResponse) {
          setInjectResponse(true)
        }
      }
    } catch (error) {
      displayError(error)
    }
  }

  const importPrivateKey = async () => {
    const session = await turnkey?.getSession()
    if (!session?.userId) {
      setError('User session not found')
      return
    }

    try {
      const encryptedBundle = await iframeClient?.extractKeyEncryptedBundle()

      if (encryptedBundle) {
        // Support both TRON and Ethereum address formats
        const addressFormats = ['ADDRESS_FORMAT_ETHEREUM', 'ADDRESS_FORMAT_TRON']
        
        const importResponse = await indexedDbClient?.importPrivateKey({
          userId: session.userId,
          privateKeyName: importName,
          encryptedBundle: encryptedBundle,
          curve: 'CURVE_SECP256K1', // Both TRON and Ethereum use SECP256K1
          addressFormats,
        })

        if (importResponse) {
          setImportComplete(true)
        }
      }
    } catch (error) {
      displayError(error)
    }
  }

  const onSubmit = async () => {
    if (!user) {
      setError('Please authenticate first')
      return
    }

    try {
      if (importComplete) {
        setIsDialogOpen(false)
      } else if (!injectResponse) {
        setLoading(true)
        if (selectedImportType === 'seed-phrase') {
          await initImportWallet()
        } else {
          await initImportPrivateKey()
        }
      } else {
        setLoading(true)
        if (selectedImportType === 'seed-phrase') {
          await importWallet()
        } else {
          await importPrivateKey()
        }
      }
    } catch (error: any) {
      displayError(error)
    } finally {
      setLoading(false)
    }
  }

  const displayError = (error: any) => {
    if (typeof error === 'string') {
      if (error.includes('cannot create uint8array from invalid hex string')) {
        setError('Invalid private key format')
      } else {
        setError(error)
      }
    } else if (error?.message?.includes('private key already exists')) {
      setError('Private key already exists')
    } else if (error?.message?.includes('already imported this wallet seed')) {
      setError('Wallet seed already imported')
    } else if (error?.message?.includes('invalid mnemonic')) {
      setError('Invalid seed phrase')
    } else {
      console.error('Import failed:', error)
      setError('Import failed. Please check your input and try again.')
    }
  }

  useEffect(() => {
    if (!isDialogOpen) {
      resetState()
    }
  }, [isDialogOpen])

  useEffect(() => {
    if (importComplete) {
      toast.success(
        `${selectedImportType === 'seed-phrase' ? 'Wallet' : 'Private Key'} imported successfully! 🎉`
      )
      // Refresh the page to reload wallet data
      setTimeout(() => window.location.reload(), 1000)
    }
  }, [importComplete, selectedImportType])

  if (!user) return null

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {injectResponse
              ? `Import ${selectedImportType === 'seed-phrase' ? 'Wallet' : 'Private Key'}`
              : 'Import Wallet'}
          </DialogTitle>
          <DialogDescription>
            {injectResponse
              ? `Enter your ${selectedImportType === 'seed-phrase' ? 'seed phrase' : 'private key'} securely`
              : 'Select what you want to import'}
          </DialogDescription>
        </DialogHeader>

        {!injectResponse && (
          <div className="py-4">
            <RadioGroup
              value={selectedImportType}
              onValueChange={setSelectedImportType}
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

        <div className={cn({ hidden: !injectResponse })}>
          <div className="h-32 w-full overflow-hidden rounded-md bg-muted p-2">
            <div
              ref={iframeContainerRef}
              className="h-full w-full"
            />
          </div>
          <div className="mt-2 inline-flex items-center text-xs text-muted-foreground">
            <Info className="mr-1 h-3 w-3" />
            {selectedImportType === 'seed-phrase'
              ? 'Seed phrases are typically 12-24 words'
              : 'Private key should be a 64-character hex string'}
          </div>
        </div>

        <div className={cn({ hidden: !injectResponse })}>
          <Input
            value={importName}
            onChange={(e) => setImportName(e.target.value)}
            placeholder={
              selectedImportType === 'seed-phrase'
                ? 'Enter wallet name (e.g., "My Imported Wallet")'
                : 'Enter private key name (e.g., "My Private Key")'
            }
          />
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
              disabled={loading || (!importName && injectResponse)}
              onClick={onSubmit}
              type="submit"
              className="w-full"
            >
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {!injectResponse
                ? 'Continue'
                : importComplete
                  ? 'Done'
                  : 'Import'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}