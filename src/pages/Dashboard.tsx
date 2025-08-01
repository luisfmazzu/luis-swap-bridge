import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import WalletInfo from '../components/WalletInfo';
import GasTracker from '../components/GasTracker';
import TipAnalytics from '../components/TipAnalytics';
import RecentActivity from '../components/RecentActivity';
import CreatorLeaderboard from '../components/CreatorLeaderboard';
import CreatorCard from '../components/CreatorCard';
import { creators } from '../creators';

const Dashboard = () => {
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        duration: 0.6
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Tipping Dashboard
          </h1>
          <p className="text-white/70">
            {isConnected 
              ? 'Manage your tips and discover amazing creators' 
              : 'Connect your wallet to start tipping creators'
            }
          </p>
        </motion.div>

        {/* Top Stats Row */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <WalletInfo />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GasTracker />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CreatorLeaderboard />
          </motion.div>
        </motion.div>

        {/* Analytics & Activity Row */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <TipAnalytics />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RecentActivity />
          </motion.div>
        </motion.div>

        {/* Creators Section */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 max-w-md">
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
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                
                <div className="flex border border-white/20 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="text-white hover:bg-white/10"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="text-white hover:bg-white/10"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Creators Grid/List */}
            <motion.div
              variants={containerVariants}
              className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }`}
            >
              {filteredCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  variants={itemVariants}
                  custom={index}
                  className={viewMode === 'list' ? 'max-w-2xl' : ''}
                >
                  <CreatorCard 
                    creator={creator} 
                    disabled={!isConnected}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredCreators.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-2">
                  No creators found
                </p>
                <p className="text-white/40">
                  Try adjusting your search terms
                </p>
              </div>
            )}

            {/* Creator Count */}
            {filteredCreators.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60 text-center">
                  Showing {filteredCreators.length} of {creators.length} creators
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;