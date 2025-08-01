import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  Calendar,
  ExternalLink,
  Filter,
  Search,
  TrendingUp,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../stores/appStore';
import { formatAddress, formatETH, formatTimestamp } from '../utils/format';
import { creators } from '../creators';

const MyTips = () => {
  const { address, isConnected } = useAccount();
  const recentTips = useAppStore(state => state.recentTips);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // Filter tips for current user
  const userTips = useMemo(() => {
    if (!address) return [];
    return recentTips.filter(tip => 
      tip.sender.toLowerCase() === address.toLowerCase()
    );
  }, [recentTips, address]);

  // Apply search and time filters
  const filteredTips = useMemo(() => {
    let tips = userTips;

    // Search filter
    if (searchTerm) {
      tips = tips.filter(tip => {
        const creator = creators.find(c => 
          c.address.toLowerCase() === tip.recipient.toLowerCase()
        );
        const creatorName = creator?.name || 'Unknown';
        return creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tip.recipient.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Time filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const periods = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const periodMs = periods[filterPeriod];
      const cutoff = new Date(now.getTime() - periodMs);
      
      tips = tips.filter(tip => new Date(tip.timestamp) >= cutoff);
    }

    return tips.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [userTips, searchTerm, filterPeriod]);

  // Statistics
  const stats = useMemo(() => {
    const total = userTips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
    const uniqueCreators = new Set(userTips.map(tip => tip.recipient)).size;
    const last24h = userTips.filter(tip => {
      const tipTime = new Date(tip.timestamp);
      const now = new Date();
      return tipTime >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
    });

    return {
      totalTips: userTips.length,
      totalAmount: total,
      uniqueCreators,
      last24hCount: last24h.length,
      last24hAmount: last24h.reduce((sum, tip) => sum + parseFloat(tip.amount), 0),
    };
  }, [userTips]);

  const getCreatorInfo = (address: string) => {
    return creators.find(c => c.address.toLowerCase() === address.toLowerCase());
  };

  const openEtherscan = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8">
              <Wallet className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-white/70 mb-6">
                Connect your wallet to view your tipping history
              </p>
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => window.location.href = '/dashboard'}
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tips</h1>
          <p className="text-white/70">
            Track all your crypto tips and support history
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Heart className="h-8 w-8 text-pink-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalTips}
                    </div>
                    <div className="text-sm text-white/60">Total Tips</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalAmount.toFixed(4)}
                    </div>
                    <div className="text-sm text-white/60">Total ETH</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.last24hCount}
                    </div>
                    <div className="text-sm text-white/60">Last 24h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Heart className="h-8 w-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.uniqueCreators}
                    </div>
                    <div className="text-sm text-white/60">Creators</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Search creators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                {/* Time Filter */}
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All Time' },
                    { key: '24h', label: '24h' },
                    { key: '7d', label: '7d' },
                    { key: '30d', label: '30d' },
                  ].map(period => (
                    <Button
                      key={period.key}
                      variant={filterPeriod === period.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterPeriod(period.key as any)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips List */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Heart className="h-5 w-5 text-pink-400" />
                <span>Tip History</span>
                <span className="text-sm text-white/60 ml-auto">
                  {filteredTips.length} tips
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTips.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredTips.map((tip, index) => {
                    const creator = getCreatorInfo(tip.recipient);
                    
                    return (
                      <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {/* Creator Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
                          {creator?.avatar || '?'}
                        </div>

                        {/* Tip Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-white">
                              {creator?.name || 'Unknown Creator'}
                            </span>
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </div>
                          <div className="text-sm text-white/70">
                            {creator?.description || formatAddress(tip.recipient)}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-white/50 mt-1">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(tip.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {formatETH(tip.amount, 4)} ETH
                          </div>
                          <div className="text-xs text-white/60 font-mono">
                            {formatAddress(tip.txHash)}
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          onClick={() => openEtherscan(tip.txHash)}
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  {userTips.length === 0 ? (
                    <>
                      <Heart className="h-16 w-16 text-white/20 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Tips Yet
                      </h3>
                      <p className="text-white/60 mb-6">
                        Start tipping creators to see your history here
                      </p>
                      <Button
                        variant="gradient"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        Discover Creators
                      </Button>
                    </>
                  ) : (
                    <>
                      <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Tips Found
                      </h3>
                      <p className="text-white/60">
                        Try adjusting your search or filter criteria
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MyTips;