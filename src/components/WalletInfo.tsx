import { useAccount, useBalance, useEnsName, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Wallet, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { formatAddress, formatETH } from '../utils/format';
import { toast } from 'react-toastify';

const WalletInfo = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const chainId = useChainId();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  const openEtherscan = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
    }
  };

  const isWrongNetwork = chainId !== sepolia.id;

  if (!isConnected || !address) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-white/60 text-sm">
            Connect your wallet to start tipping creators
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Wallet className="h-5 w-5 text-indigo-400" />
          <span>Wallet Info</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Warning */}
          {isWrongNetwork && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2"
            >
              <AlertCircle className="h-4 w-4 text-red-400" />
              <div className="text-sm text-red-400">
                Please switch to Sepolia testnet
              </div>
            </motion.div>
          )}

          {/* Address */}
          <div>
            <div className="text-xs text-white/60 mb-2">Address</div>
            <div className="flex items-center space-x-2">
              <div className="font-mono text-sm text-white bg-black/20 px-3 py-2 rounded border flex-1">
                {ensName || formatAddress(address)}
              </div>
              <Button
                onClick={copyAddress}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                onClick={openEtherscan}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div>
            <div className="text-xs text-white/60 mb-2">Balance</div>
            <div className="text-2xl font-bold text-white">
              {balance ? formatETH(balance.value, 4) : '0.0000'} ETH
            </div>
            {balance && balance.value === BigInt(0) && (
              <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-xs text-yellow-200 mb-2">
                  Need test ETH? Get some from the Sepolia faucet:
                </p>
                <Button
                  onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}
                  size="sm"
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-200 hover:bg-yellow-500/10"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Test ETH
                </Button>
              </div>
            )}
          </div>

          {/* Network Status */}
          <div>
            <div className="text-xs text-white/60 mb-2">Network</div>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded border ${
              isWrongNetwork 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-green-500/20 border-green-500/50 text-green-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isWrongNetwork ? 'bg-red-400' : 'bg-green-400'
              } animate-pulse`}></div>
              <span className="text-sm font-medium">
                {isWrongNetwork ? 'Wrong Network' : 'Sepolia Testnet'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;