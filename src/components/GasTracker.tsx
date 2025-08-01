import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Fuel, TrendingUp, Clock, Zap, AlertTriangle } from 'lucide-react';
import { formatGasPrice } from '../utils/format';
import { useEnhancedGasData, useCombinedGasData } from '../hooks/useGasData';

const GasTracker = () => {
  const { data: enhancedGasData, isLoading, isError, error } = useEnhancedGasData();
  const { data: combinedGasData } = useCombinedGasData();

  // Use enhanced data if available, fallback to basic gas calculations
  const gasLevels = enhancedGasData && combinedGasData ? [
    {
      name: 'Slow',
      price: formatGasPrice(combinedGasData.recommendations.slow.gasPrice),
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      time: combinedGasData.recommendations.slow.estimatedTime,
    },
    {
      name: 'Standard',
      price: formatGasPrice(combinedGasData.recommendations.standard.gasPrice),
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      time: combinedGasData.recommendations.standard.estimatedTime,
    },
    {
      name: 'Fast',
      price: formatGasPrice(combinedGasData.recommendations.fast.gasPrice),
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      time: combinedGasData.recommendations.fast.estimatedTime,
    },
  ] : [
    {
      name: 'Slow',
      price: 'Loading...',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      time: '~5 min',
    },
    {
      name: 'Standard',
      price: 'Loading...',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      time: '~2 min',
    },
    {
      name: 'Fast',
      price: 'Loading...',
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      time: '~30 sec',
    },
  ];

  // Get network congestion color
  const getCongestionColor = (congestion?: 'low' | 'medium' | 'high') => {
    switch (congestion) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-indigo-400" />
            <span>Gas Tracker</span>
          </div>
          {enhancedGasData && (
            <div className={`flex items-center space-x-1 text-xs ${getCongestionColor(enhancedGasData.networkCongestion)}`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              <span className="capitalize">{enhancedGasData.networkCongestion}</span>
            </div>
          )}
        </CardTitle>
        {enhancedGasData?.historicalData && (
          <p className="text-xs text-white/60">
            24h avg: {enhancedGasData.historicalData.avgGasPrice24h} gwei
            <span className={`ml-2 ${enhancedGasData.historicalData.trend === 'up' ? 'text-red-400' : enhancedGasData.historicalData.trend === 'down' ? 'text-green-400' : 'text-gray-400'}`}>
              {enhancedGasData.historicalData.trend === 'up' ? '↗' : enhancedGasData.historicalData.trend === 'down' ? '↘' : '→'}
            </span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {gasLevels.map((level, index) => (
            <motion.div
              key={level.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg ${level.bgColor} border border-white/10`}
            >
              <div className="flex items-center space-x-3">
                <level.icon className={`h-4 w-4 ${level.color}`} />
                <div>
                  <div className="text-sm font-medium text-white">
                    {level.name}
                  </div>
                  <div className="text-xs text-white/60">{level.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {level.price}
                </div>
                <div className="text-xs text-white/60">gwei</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {isLoading && !enhancedGasData && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto mb-2"></div>
            <p className="text-sm text-white/60">Loading gas prices...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-4">
            <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400">Failed to load gas data</p>
            <p className="text-xs text-white/60 mt-1">Using fallback prices</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GasTracker;