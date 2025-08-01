import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Activity, ExternalLink, Heart, Clock } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { formatAddress, formatETH, formatTimestamp } from '../utils/format';
import { creators } from '../creators';

const RecentActivity = () => {
  const recentTips = useAppStore(state => state.recentTips);

  const getCreatorName = (address: string) => {
    const creator = creators.find(c => c.address.toLowerCase() === address.toLowerCase());
    return creator?.name || 'Unknown Creator';
  };

  const openEtherscan = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  // Show last 10 tips
  const displayTips = recentTips.slice(0, 10);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Activity className="h-5 w-5 text-indigo-400" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {displayTips.length > 0 ? (
            displayTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      Tipped {formatETH(tip.amount, 4)} ETH
                    </div>
                    <div className="text-xs text-white/60">
                      to {getCreatorName(tip.recipient)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-white/50 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(tip.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-xs text-white/60">From</div>
                    <div className="text-xs font-mono text-white/80">
                      {formatAddress(tip.sender)}
                    </div>
                  </div>
                  <Button
                    onClick={() => openEtherscan(tip.txHash)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-sm">
                No recent activity yet.
              </p>
              <p className="text-white/40 text-xs mt-1">
                Tips will appear here as they happen.
              </p>
            </div>
          )}
        </div>
        
        {displayTips.length > 0 && recentTips.length > 10 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-white/60 text-center">
              Showing {displayTips.length} of {recentTips.length} recent tips
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;