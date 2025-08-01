import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Zap, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Heart,
  Percent
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { formatAddress, formatETH, validateETHAmount } from '../utils/format';

const TipModal = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const selectedCreator = useAppStore(state => state.selectedCreator);
  const isModalOpen = useAppStore(state => state.isModalOpen);
  const setModalOpen = useAppStore(state => state.setModalOpen);
  const setSelectedCreator = useAppStore(state => state.setSelectedCreator);
  const addTip = useAppStore(state => state.addTip);

  const [tipAmount, setTipAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'pending' | 'success' | 'error'>('input');
  const [error, setError] = useState('');

  const {
    sendTransaction,
    isPending: isSending,
    data: txHash,
    error: sendError,
    reset: resetSend
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setTipAmount('');
      setCustomAmount('');
      setStep('input');
      setError('');
      resetSend();
    }
  }, [isModalOpen, resetSend]);

  // Handle transaction states
  useEffect(() => {
    if (isSending) {
      setStep('pending');
    } else if (sendError) {
      setStep('error');
      setError(sendError.message);
      toast.error('Transaction failed');
    } else if (txHash && isConfirming) {
      toast.info('Transaction submitted! Waiting for confirmation...');
    } else if (isConfirmed && txHash && selectedCreator && address) {
      setStep('success');
      addTip({
        recipient: selectedCreator.address,
        sender: address,
        amount: tipAmount,
        txHash,
        creatorName: selectedCreator.name,
      });
      toast.success('Tip sent successfully! 🎉');
    } else if (confirmError) {
      setStep('error');
      setError('Transaction confirmation failed');
      toast.error('Transaction confirmation failed');
    }
  }, [isSending, sendError, txHash, isConfirming, isConfirmed, confirmError, selectedCreator, address, tipAmount, addTip]);

  const handleClose = () => {
    setModalOpen(false);
    setSelectedCreator(null);
  };

  const handleAmountSelect = (percentage: number) => {
    if (!balance) return;
    const balanceEth = parseFloat(formatETH(balance.value));
    const amount = (balanceEth * percentage / 100).toFixed(6);
    setTipAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setTipAmount(value);
  };

  const handleConfirm = () => {
    if (!selectedCreator || !tipAmount || !isConnected) return;

    const validation = validateETHAmount(tipAmount);
    if (!validation.valid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    // Check balance
    if (balance) {
      const balanceEth = parseFloat(formatETH(balance.value));
      const tipAmountNum = parseFloat(tipAmount);
      if (tipAmountNum > balanceEth) {
        setError('Insufficient balance');
        return;
      }
    }

    setError('');
    setStep('confirm');
  };

  const handleSendTransaction = () => {
    if (!selectedCreator || !tipAmount) return;

    try {
      sendTransaction({
        to: selectedCreator.address,
        value: parseEther(tipAmount),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
      setStep('error');
    }
  };

  const openEtherscan = () => {
    if (txHash) {
      window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
    }
  };

  const suggestedAmounts = [
    { label: '1%', percentage: 1 },
    { label: '5%', percentage: 5 },
    { label: '10%', percentage: 10 },
  ];

  if (!selectedCreator) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
              {selectedCreator.avatar}
            </div>
            <span>Tip {selectedCreator.name}</span>
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Creator Info */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-white/70 mb-2">{selectedCreator.description}</p>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Wallet: {formatAddress(selectedCreator.address)}</span>
                  <span>Sepolia Testnet</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Tip Amount (ETH)
                </label>
                <Input
                  type="number"
                  placeholder="0.0000"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
                  step="0.0001"
                  min="0.0001"
                />
              </div>

              {/* Suggested Amounts */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {suggestedAmounts.map((suggestion) => {
                    const balanceEth = balance ? parseFloat(formatETH(balance.value)) : 0;
                    const amount = (balanceEth * suggestion.percentage / 100).toFixed(6);
                    
                    return (
                      <Button
                        key={suggestion.percentage}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountSelect(suggestion.percentage)}
                        className="border-white/20 text-white hover:bg-white/10 flex flex-col p-3 h-auto"
                        disabled={!balance || balanceEth === 0}
                      >
                        <Percent className="h-3 w-3 mb-1" />
                        <span className="text-xs">{suggestion.label}</span>
                        <span className="text-xs text-white/60">{amount} ETH</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Balance Info */}
              {balance && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-200">Your Balance:</span>
                    <span className="font-mono text-blue-100">
                      {formatETH(balance.value, 4)} ETH
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-200">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!tipAmount || !isConnected}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Heart className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Confirm Your Tip
                </h3>
                <p className="text-white/70">
                  You're about to send a tip to {selectedCreator.name}
                </p>
              </div>

              {/* Transaction Summary */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Amount:</span>
                  <span className="font-mono text-white">{tipAmount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">To:</span>
                  <span className="font-mono text-white">
                    {formatAddress(selectedCreator.address)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Network:</span>
                  <span className="text-white">Sepolia Testnet</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('input')}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSendTransaction}
                  disabled={isSending}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Send Tip
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6"
            >
              <div className="relative">
                <Loader2 className="h-16 w-16 text-indigo-400 mx-auto animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isConfirming ? 'Confirming Transaction...' : 'Processing Tip...'}
                </h3>
                <p className="text-white/70 mb-4">
                  {isConfirming 
                    ? 'Waiting for blockchain confirmation' 
                    : 'Please confirm the transaction in your wallet'
                  }
                </p>
                {txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEtherscan}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View on Etherscan
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Tip Sent Successfully! 🎉
                </h3>
                <p className="text-white/70 mb-4">
                  Your {tipAmount} ETH tip has been sent to {selectedCreator.name}
                </p>
                {txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEtherscan}
                    className="border-white/20 text-white hover:bg-white/10 mb-4"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Transaction
                  </Button>
                )}
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Done
              </Button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6"
            >
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Transaction Failed
                </h3>
                <p className="text-white/70 mb-4">
                  {error || 'Something went wrong. Please try again.'}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setStep('input')}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default TipModal;