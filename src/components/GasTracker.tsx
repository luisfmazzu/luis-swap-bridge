import { useEffect, useState } from 'react';
import { useFeeData } from 'wagmi';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Fuel, TrendingUp, Clock, Zap } from 'lucide-react';
import { formatGasPrice } from '../utils/format';

const GasTracker = () => {
  const { data: feeData, refetch } = useFeeData({ watch: true });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const gasPrice = feeData?.gasPrice || BigInt(0);
  const slowGas = gasPrice;
  const averageGas = (gasPrice * BigInt(120)) / BigInt(100); // 20% higher
  const fastGas = (gasPrice * BigInt(150)) / BigInt(100); // 50% higher

  const gasLevels = [
    {
      name: 'Slow',
      price: formatGasPrice(slowGas),
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      time: '~5 min',
    },
    {
      name: 'Average',
      price: formatGasPrice(averageGas),
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      time: '~2 min',
    },
    {
      name: 'Fast',
      price: formatGasPrice(fastGas),
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      time: '~30 sec',
    },
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Fuel className="h-5 w-5 text-indigo-400" />
          <span>Gas Tracker</span>
        </CardTitle>
        <p className="text-xs text-white/60">
          Updated {lastUpdate.toLocaleTimeString()}
        </p>
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
        
        {!feeData && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto mb-2"></div>
            <p className="text-sm text-white/60">Loading gas prices...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GasTracker;