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
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useCurrentUserAnalytics } from '../hooks/useAnalytics';
import { useRecentTips } from '../hooks/useTips';

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
  const { data: userAnalytics, isLoading: isLoadingAnalytics, error: analyticsError } = useCurrentUserAnalytics();
  const { data: recentTips, isLoading: isLoadingTips } = useRecentTips();

  const chartData = useMemo(() => {
    if (!userAnalytics?.monthlyStats) {
      return null;
    }

    // Use the last 12 months of data for the chart
    const labels = userAnalytics.monthlyStats.map(stat => {
      const date = new Date(stat.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    
    const amounts = userAnalytics.monthlyStats.map(stat => parseFloat(stat.volume));

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Tips (ETH)',
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
  }, [userAnalytics]);

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

  const isLoading = isLoadingAnalytics || isLoadingTips;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          <span>Tip Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mr-3" />
            <p className="text-white/60">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {analyticsError && !isLoading && (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-red-400 mr-3" />
            <div className="text-center">
              <p className="text-red-400 font-medium">Failed to load analytics</p>
              <p className="text-white/60 text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !analyticsError && userAnalytics && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userAnalytics.tipCount}</div>
                <div className="text-xs text-white/60">Total Tips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{parseFloat(userAnalytics.totalTipped).toFixed(4)}</div>
                <div className="text-xs text-white/60">Total ETH</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userAnalytics.last30Days.tips}</div>
                <div className="text-xs text-white/60">Last 30d</div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-lg font-bold text-white">{userAnalytics.uniqueCreators}</div>
                <div className="text-xs text-white/60">Creators Supported</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-lg font-bold text-white">{parseFloat(userAnalytics.averageTip).toFixed(4)}</div>
                <div className="text-xs text-white/60">Avg Tip Size</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64">
              {chartData ? (
                <Line data={chartData} options={options} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">
                      No tip history available for chart
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State for not connected users */}
        {!isLoading && !analyticsError && !userAnalytics && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-sm">
                Connect your wallet to see personal analytics
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TipAnalytics;