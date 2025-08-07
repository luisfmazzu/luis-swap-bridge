'use client'

import React, { useEffect, useState } from 'react'
import { useTurnkeyWallet, formatBalanceForDisplay } from '@/hooks/use-turnkey-wallet'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAuth } from '@/contexts/auth-provider'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CopyIcon,
  ExternalLink,
  Loader
} from 'lucide-react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

type TransferAction = 'send' | 'receive'

interface SendReceiveDialogProps {
  selectedNetwork?: 'tron' | 'ethereum'
}

export function SendReceiveDialog({ selectedNetwork }: SendReceiveDialogProps) {
  const { walletInfo, selectedAccount } = useTurnkeyWallet(selectedNetwork)
  const { indexedDbClient } = useTurnkey()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const isDesktop = !isMobile

  // Controls the dialog open/close state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<TransferAction>('send')
  const [currentView, setCurrentView] = useState<'send' | 'receive' | 'sendTransaction'>('send')
  
  // Send form state
  const [amount, setAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const networkConfig = selectedAccount?.networkConfig

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('send')
      setAmount('')
      setRecipientAddress('')
    }
  }, [isOpen])

  // Validate send form
  useEffect(() => {
    if (recipientAddress && amount && walletInfo?.balance) {
      try {
        const amountNum = parseFloat(amount)
        const balanceFormatted = parseFloat(formatBalanceForDisplay(walletInfo.balance, networkConfig!))
        const valid = amountNum > 0 && amountNum <= balanceFormatted && recipientAddress.length > 10
        setIsValid(valid)
      } catch {
        setIsValid(false)
      }
    } else {
      setIsValid(false)
    }
  }, [amount, recipientAddress, walletInfo?.balance, networkConfig])

  const handleCopyAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address)
        toast.success('Address copied to clipboard')
      } catch {
        toast.error('Failed to copy address')
      }
    }
  }

  const handleSendTransaction = async () => {
    if (!walletInfo?.address || !indexedDbClient || !user?.organization?.organizationId) {
      toast.error('Wallet not ready for transactions')
      return
    }

    setLoading(true)
    try {
      // This is a simplified example - in production you'd implement actual transaction sending
      // For TRON vs Ethereum, you'd use different transaction formats and RPC calls
      
      toast.success(`Transaction simulated: ${amount} ${networkConfig?.symbol} to ${recipientAddress}`)
      setIsOpen(false)
      
      // In real implementation:
      // - Create transaction based on network (TRON TRC20 vs Ethereum ERC20)
      // - Sign with Turnkey
      // - Broadcast to network
      
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.error('Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const SendTab = () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-center mb-4">
          <div className="text-4xl font-light mb-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="text-center text-4xl border-none shadow-none font-light p-0 h-auto"
            />
          </div>
          <div className="text-lg text-muted-foreground">
            ~${networkConfig ? (parseFloat(amount || '0') * networkConfig.mockPrice).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="flex items-center p-4 rounded-lg border">
        <div 
          className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-xs ${
            networkConfig?.id === 'tron' 
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : 'bg-gradient-to-r from-purple-500 to-blue-500'
          }`}
        >
          {networkConfig?.symbol.slice(0, 3).toUpperCase()}
        </div>
        <div className="flex-grow">
          <div className="font-semibold">Send</div>
          <div className="text-sm text-muted-foreground">{networkConfig?.name} ({networkConfig?.testnet})</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">
            {walletInfo?.balance && networkConfig 
              ? formatBalanceForDisplay(walletInfo.balance, networkConfig)
              : '0'
            }{' '}
            <span className="text-sm text-muted-foreground">{networkConfig?.symbol}</span>
          </div>
          <div className="text-sm text-muted-foreground">Balance</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input
          id="recipient"
          placeholder={networkConfig?.id === 'tron' ? 'TQn9Y2khE...' : '0x742d35C...'}
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="font-mono"
        />
      </div>

      <Button
        disabled={!isValid || loading}
        className="w-full"
        onClick={handleSendTransaction}
      >
        {loading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            Send Transaction
            <ChevronRight className="ml-2" size={20} />
          </>
        )}
      </Button>
    </div>
  )

  const ReceiveTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Receive {networkConfig?.symbol}</h2>
          <p className="text-muted-foreground">on {networkConfig?.name} {networkConfig?.testnet}</p>
        </div>
      </div>

      <div className="mx-auto w-2/5 rounded-lg dark:bg-white sm:w-8/12">
        <QRCode
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={walletInfo?.address || ""}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Your Address</Label>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="font-mono text-sm break-all mr-2">
            {isDesktop
              ? walletInfo?.address
              : walletInfo?.formattedAddress}
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
            <CopyIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs text-muted-foreground">
          This address can only receive {networkConfig?.name} testnet assets. 
          Sending mainnet or other network assets will result in loss of funds.
        </AlertDescription>
      </Alert>
    </div>
  )

  const TransferContent = () => (
    <Card className="w-full border-0 shadow-none">
      <CardContent className="p-4">
        <Tabs value={selectedAction} onValueChange={(value) => setSelectedAction(value as TransferAction)} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <SendTab />
          </TabsContent>
          <TabsContent value="receive">
            <ReceiveTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  if (!user) return null

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-center gap-2">
          <DialogTrigger asChild>
            <Button
              onClick={() => setSelectedAction('send')}
              variant="secondary"
              size="sm"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Send
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => setSelectedAction('receive')}
              variant="secondary"
              size="sm"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Receive
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent className="p-4 sm:max-w-[480px]">
          <DialogTitle className="sr-only">Transfer Dialog</DialogTitle>
          <DialogDescription className="sr-only">
            Send or receive {networkConfig?.symbol} to your Turnkey wallet
          </DialogDescription>
          <TransferContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex w-full items-center justify-center gap-2">
        <DrawerTrigger asChild>
          <Button
            onClick={() => setSelectedAction('send')}
            variant="secondary"
            className="w-full"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Send
          </Button>
        </DrawerTrigger>
        <DrawerTrigger asChild>
          <Button
            onClick={() => setSelectedAction('receive')}
            variant="secondary"
            className="w-full"
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Receive
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent className="px-4">
        <DrawerTitle className="sr-only">Transfer {networkConfig?.symbol}</DrawerTitle>
        <DrawerDescription className="sr-only">
          Send or receive {networkConfig?.symbol} to your Turnkey wallet
        </DrawerDescription>
        <TransferContent />
        <DrawerFooter className="m-0 py-0 pb-4">
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}