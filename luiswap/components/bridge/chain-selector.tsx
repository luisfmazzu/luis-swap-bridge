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
import { CHAIN_INFO, getChainName, getChainIcon, getChainColor } from '@/lib/constants/chains'

interface ChainSelectorProps {
  selectedChainId?: number
  onChainSelect: (chainId: number) => void
  label?: string
  disabled?: boolean
  excludeChainId?: number // Exclude a specific chain (e.g., the other chain in bridge)
}

export function ChainSelector({
  selectedChainId,
  onChainSelect,
  label = 'Select Chain',
  disabled = false,
  excludeChainId,
}: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get available chains
  const availableChains = Object.values(CHAIN_INFO).filter(
    chain => chain.id !== excludeChainId
  )
  
  // Filter chains based on search query
  const filteredChains = availableChains.filter(chain =>
    chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chain.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChainSelect = (chainId: number) => {
    onChainSelect(chainId)
    setIsOpen(false)
    setSearchQuery('')
  }

  const selectedChain = selectedChainId ? CHAIN_INFO[selectedChainId] : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="justify-between h-12 bg-muted/30 border-border/50 hover:bg-muted/50"
          disabled={disabled}
        >
          {selectedChain ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selectedChain.color}20` }}
              >
                <span 
                  className="text-xs font-bold"
                  style={{ color: selectedChain.color }}
                >
                  {selectedChain.shortName.charAt(0)}
                </span>
              </div>
              <span className="font-medium">{selectedChain.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Chain</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a blockchain network
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>

          {/* Chain List */}
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredChains.length > 0 ? (
              filteredChains.map((chain, index) => (
                <ChainListItem
                  key={chain.id}
                  chain={chain}
                  onSelect={handleChainSelect}
                  delay={index * 0.05}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No chains found' : 'No chains available'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ChainListItem({
  chain,
  onSelect,
  delay = 0,
}: {
  chain: typeof CHAIN_INFO[number]
  onSelect: (chainId: number) => void
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Button
        variant="ghost"
        onClick={() => onSelect(chain.id)}
        className="w-full justify-start h-16 p-4 hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${chain.color}20` }}
          >
            <span 
              className="text-sm font-bold"
              style={{ color: chain.color }}
            >
              {chain.shortName.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <div className="font-medium text-foreground">{chain.name}</div>
            <div className="text-sm text-muted-foreground">
              {chain.nativeCurrency.symbol} Network
            </div>
          </div>
        </div>
      </Button>
    </motion.div>
  )
}