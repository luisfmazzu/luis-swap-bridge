import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TipAnalytics = () => {
  const recentTips = useAppStore(state => state.recentTips);

  const chartData = useMemo(() => {
    // Get tips from last 24 hours grouped by hour
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(last24Hours.getTime() + i * 60 * 60 * 1000);
      const tips = recentTips.filter(tip => {
        const tipTime = new Date(tip.timestamp);
        return tipTime >= hour && tipTime < new Date(hour.getTime() + 60 * 60 * 1000);
      });
      
      const totalAmount = tips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
      
      return {
        hour: hour.getHours(),
        amount: totalAmount,
        count: tips.length,
      };
    });

    const labels = hourlyData.map(data => `${data.hour}:00`);
    const amounts = hourlyData.map(data => data.amount);

    return {
      labels,
      datasets: [
        {
          label: 'Tips (ETH)',
          data: amounts,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [recentTips]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toFixed(4)} ETH`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value: any) {
            return `${value} ETH`;
          },
        },
        beginAtZero: true,
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(99, 102, 241)',
      },
    },
  };

  const totalTips = recentTips.length;
  const totalAmount = recentTips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
  const last24HoursTips = recentTips.filter(tip => {
    const tipTime = new Date(tip.timestamp);
    const now = new Date();
    return tipTime >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
  });

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          <span>Tip Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalTips}</div>
            <div className="text-xs text-white/60">Total Tips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalAmount.toFixed(4)}</div>
            <div className="text-xs text-white/60">Total ETH</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{last24HoursTips.length}</div>
            <div className="text-xs text-white/60">Last 24h</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          {totalTips > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-sm">
                  No tips yet. Start tipping creators to see analytics!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TipAnalytics;