import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { creators } from '../creators';
import { formatETH } from '../utils/format';

const CreatorLeaderboard = () => {
  const recentTips = useAppStore(state => state.recentTips);

  const leaderboardData = useMemo(() => {
    // Calculate tips for each creator
    const creatorStats = creators.map(creator => {
      const creatorTips = recentTips.filter(
        tip => tip.recipient.toLowerCase() === creator.address.toLowerCase()
      );
      
      const totalAmount = creatorTips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
      const tipCount = creatorTips.length;
      
      return {
        ...creator,
        totalTips: totalAmount.toString(),
        tipCount,
        realTotalAmount: totalAmount,
      };
    });

    // Sort by total amount received
    return creatorStats.sort((a, b) => b.realTotalAmount - a.realTotalAmount);
  }, [recentTips]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-4 w-4 text-white/60" />;
    }
  };

  const getRankColors = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
        };
      case 1:
        return {
          bg: 'bg-gradient-to-r from-gray-400/20 to-slate-400/20',
          border: 'border-gray-400/50',
          text: 'text-gray-400',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-amber-600/20 to-orange-600/20',
          border: 'border-amber-600/50',
          text: 'text-amber-600',
        };
      default:
        return {
          bg: 'bg-white/5',
          border: 'border-white/10',
          text: 'text-white',
        };
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Trophy className="h-5 w-5 text-indigo-400" />
          <span>Creator Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {leaderboardData.map((creator, index) => {
            const colors = getRankColors(index);
            
            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-3 rounded-lg border ${colors.bg} ${colors.border} hover:scale-105 transition-all duration-200`}
              >
                {/* Rank */}
                <div className="flex items-center space-x-2 min-w-[60px]">
                  <span className={`text-sm font-bold ${colors.text}`}>
                    #{index + 1}
                  </span>
                  {getRankIcon(index)}
                </div>

                {/* Creator Info */}
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
                    {creator.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {creator.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {creator.description}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${colors.text}`}>
                    {formatETH(creator.totalTips, 3)}
                  </div>
                  <div className="text-xs text-white/60">
                    {creator.tipCount} tips
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Special recognition for top 3 */}
        {leaderboardData.some(creator => creator.realTotalAmount > 0) && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-xs text-white/60 text-center">
              🏆 Top performers this session
            </div>
          </div>
        )}

        {/* Empty state */}
        {!leaderboardData.some(creator => creator.realTotalAmount > 0) && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-sm">
              No tips yet!
            </p>
            <p className="text-white/40 text-xs mt-1">
              Start tipping creators to see the leaderboard.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreatorLeaderboard;