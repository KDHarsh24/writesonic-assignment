import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function BrandHistory() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [brand, setBrand] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, days]);

  const fetchData = async () => {
    try {
      const [brandRes, historyRes] = await Promise.all([
        fetch(`/api/brands/${id}`),
        fetch(`/api/brands/${id}/history?days=${days}`),
      ]);

      const [brandData, historyData] = await Promise.all([
        brandRes.json(),
        historyRes.json(),
      ]);

      if (brandData.success) setBrand(brandData.data);
      if (historyData.success) setHistory(historyData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const latestVisibility = history.length > 0 ? history[history.length - 1].visibility : 0;
  const previousVisibility = history.length > 1 ? history[history.length - 2].visibility : 0;
  const visibilityTrend = latestVisibility - previousVisibility;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                href={`/brand/${id}`}
                className="inline-flex items-center text-dark-500 hover:text-dark-700 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-dark-900">{brand?.name} - History</h1>
                <p className="text-sm text-dark-500">Track your visibility over time</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    days === d
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-dark-500 hover:bg-dark-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {history.length === 0 ? (
          <div className="bg-white rounded-xl p-12 card-shadow text-center">
            <BarChart3 className="w-12 h-12 text-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No history data yet</h3>
            <p className="text-dark-500">Run analysis to start tracking your visibility over time</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark-500 text-sm">Current Visibility</span>
                  {visibilityTrend !== 0 && (
                    <span
                      className={`flex items-center text-sm ${
                        visibilityTrend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {visibilityTrend > 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(visibilityTrend)}%
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold text-dark-900">{latestVisibility}%</div>
              </div>

              <div className="bg-white rounded-xl p-6 card-shadow">
                <div className="text-dark-500 text-sm mb-2">Total Analyses</div>
                <div className="text-3xl font-bold text-dark-900">
                  {history.reduce((sum, day) => sum + day.total, 0)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 card-shadow">
                <div className="text-dark-500 text-sm mb-2">Days Tracked</div>
                <div className="text-3xl font-bold text-dark-900">{history.length}</div>
              </div>
            </div>

            {/* Visibility Chart */}
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-dark-900 mb-6">Visibility Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorVisibility" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value) => [`${value}%`, 'Visibility']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="visibility"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVisibility)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Data Table */}
            <div className="bg-white rounded-xl card-shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-dark-100">
                <h3 className="text-lg font-semibold text-dark-900">Daily Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Visibility</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Analyses</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Mentioned</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Avg Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {history.slice().reverse().map((day) => (
                      <tr key={day.date} className="hover:bg-dark-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-dark-900 font-medium">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-dark-400" />
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              day.visibility >= 70
                                ? 'bg-green-100 text-green-700'
                                : day.visibility >= 40
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {day.visibility}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-dark-600">{day.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-dark-600">{day.mentioned}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-dark-600">{day.avgRank || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
