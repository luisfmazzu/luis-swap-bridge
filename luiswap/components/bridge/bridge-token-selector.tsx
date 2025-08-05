'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ChevronDown, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { type Token, getBridgeTokensByChain } from '@/lib/constants/tokens'
import { useWeb3 } from '@/hooks/use-web3'
import { useTokenBalance } from '@/hooks/use-token-balance'

interface BridgeTokenSelectorProps {
  selectedToken?: Token
  onTokenSelect: (token: Token) => void
  chainId: number
  label?: string
  disabled?: boolean
}

export function BridgeTokenSelector({
  selectedToken,
  onTokenSelect,
  chainId,
  label = 'Token',
  disabled = false,
}: BridgeTokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { address } = useWeb3()
  
  // Get available bridge tokens for specified chain (only USDT and USDC)
  const availableTokens = getBridgeTokensByChain(chainId)
  
  // Filter tokens based on search query
  const filteredTokens = availableTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="justify-between h-12 w-32 bg-muted/30 border-border/50 hover:bg-muted/50"
          disabled={disabled}
        >
          {selectedToken ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {selectedToken.symbol.charAt(0)}
                </span>
              </div>
              <span className="font-medium">{selectedToken.symbol}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Bridge Token</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a token to bridge (USDT or USDC only)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>

          {/* Token List */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token, index) => (
                <BridgeTokenListItem
                  key={token.address}
                  token={token}
                  onSelect={handleTokenSelect}
                  delay={index * 0.05}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No tokens found' : 'No bridge tokens available'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BridgeTokenListItem({
  token,
  onSelect,
  delay = 0,
}: {
  token: Token
  onSelect: (token: Token) => void
  delay?: number
}) {
  const { address } = useWeb3()
  
  const { balance } = useTokenBalance({
    address,
    token,
    enabled: !!address,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Button
        variant="ghost"
        onClick={() => onSelect(token)}
        className="w-full justify-start h-16 p-4 hover:bg-muted/50"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {token.symbol.charAt(0)}
              </span>
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground">{token.symbol}</div>
              <div className="text-sm text-muted-foreground truncate max-w-32">
                {token.name}
              </div>
            </div>
          </div>
          
          {address && (
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                {parseFloat(balance.formatted).toLocaleString('en-US', {
                  maximumFractionDigits: 6,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Balance
              </div>
            </div>
          )}
        </div>
      </Button>
    </motion.div>
  )
}