import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Heart, Zap } from 'lucide-react';
import { Creator } from '../types';
import { formatAddress, formatETH } from '../utils/format';
import { useAppStore } from '../stores/appStore';

interface CreatorCardProps {
  creator: Creator;
  disabled?: boolean;
  onTip?: (creator: Creator) => void;
}

const CreatorCard = ({ creator, disabled = false, onTip }: CreatorCardProps) => {
  const setSelectedCreator = useAppStore(state => state.setSelectedCreator);
  const setModalOpen = useAppStore(state => state.setModalOpen);

  const handleTipClick = () => {
    if (disabled) return;
    setSelectedCreator(creator);
    setModalOpen(true);
    onTip?.(creator);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden group">
        <CardContent className="p-6">
          {/* Avatar and Status */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                {creator.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{creator.name}</h3>
              <p className="text-white/70 text-sm">{creator.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-lg font-semibold text-white">
                {formatETH(creator.totalTips || '0', 3)}
              </div>
              <div className="text-xs text-white/60">Total Tips</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-lg font-semibold text-white">
                {creator.tipCount || 0}
              </div>
              <div className="text-xs text-white/60">Supporters</div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <div className="text-xs text-white/50 mb-1">Wallet Address</div>
            <div className="font-mono text-sm text-white/80 bg-black/20 px-3 py-2 rounded border">
              {formatAddress(creator.address)}
            </div>
          </div>

          {/* Tip Button */}
          <Button
            onClick={handleTipClick}
            disabled={disabled}
            className={`w-full ${
              disabled 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform group-hover:scale-105'
            } transition-all duration-300`}
          >
            {disabled ? (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Connect Wallet First
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Tip Creator
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreatorCard;