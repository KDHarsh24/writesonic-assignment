import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  MessageSquare,
  Award,
  Link2,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Play,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from 'lucide-react';

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-dark-400'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : trend < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-dark-900 mb-1">{value}</div>
      <div className="text-sm text-dark-500">{title}</div>
      {subtitle && <div className="text-xs text-dark-400 mt-1">{subtitle}</div>}
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, max = 100, color = 'primary' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    primary: 'bg-primary-500',
    accent: 'bg-accent-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default function BrandDashboard() {
  const router = useRouter();
  const { id } = router.query;

  const [brand, setBrand] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newQuery, setNewQuery] = useState('');
  const [showAddQuery, setShowAddQuery] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      const [brandRes, dashboardRes, queriesRes, resultsRes] = await Promise.all([
        fetch(`/api/brands/${id}`),
        fetch(`/api/brands/${id}/dashboard`),
        fetch(`/api/brands/${id}/queries`),
        fetch(`/api/brands/${id}/results`),
      ]);

      const [brandData, dashboardData, queriesData, resultsData] = await Promise.all([
        brandRes.json(),
        dashboardRes.json(),
        queriesRes.json(),
        resultsRes.json(),
      ]);

      if (brandData.success) setBrand(brandData.data);
      if (dashboardData.success) setDashboard(dashboardData.data);
      if (queriesData.success) setQueries(queriesData.data);
      if (resultsData.success) setResults(resultsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const generateQueries = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/brands/${id}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setQueries((prev) => [...data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error generating queries:', error);
    } finally {
      setGenerating(false);
    }
  };

  const addCustomQuery = async () => {
    if (!newQuery.trim()) return;

    try {
      const res = await fetch(`/api/brands/${id}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newQuery, isCustom: true }),
      });
      const data = await res.json();
      if (data.success) {
        setQueries((prev) => [...data.data, ...prev]);
        setNewQuery('');
        setShowAddQuery(false);
      }
    } catch (error) {
      console.error('Error adding query:', error);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/brands/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data after analysis
        fetchData();
      }
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteQuery = async (queryId) => {
    try {
      await fetch(`/api/queries/${queryId}`, { method: 'DELETE' });
      setQueries((prev) => prev.filter((q) => q._id !== queryId));
    } catch (error) {
      console.error('Error deleting query:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-dark-900 font-semibold mb-2">Brand not found</p>
          <Link href="/" className="text-primary-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const pendingQueries = queries.filter((q) => q.status === 'pending' || q.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-dark-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-dark-500 hover:text-dark-700 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-dark-900">{brand.name}</h1>
                <p className="text-sm text-dark-500">{brand.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href={`/brand/${id}/settings`}
                className="p-2 text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              {pendingQueries > 0 && (
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium text-sm shadow-lg shadow-primary-500/25 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Analysis ({pendingQueries})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Analyzing Banner */}
      {analyzing && (
        <div className="bg-primary-50 border-b border-primary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center text-primary-700">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="font-medium">Analysis in progress... This may take a few minutes. The page will auto-refresh.</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'queries', 'leaderboard', 'citations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Visibility Score"
                value={`${dashboard?.metrics?.visibilityScore || 0}%`}
                subtitle="of prompts mention your brand"
                icon={Eye}
                color="primary"
              />
              <MetricCard
                title="Answers Mentioned"
                value={dashboard?.metrics?.answersMentioned || 0}
                subtitle={`of ${dashboard?.metrics?.totalPrompts || 0} total`}
                icon={MessageSquare}
                color="accent"
              />
              <MetricCard
                title="Average Rank"
                value={dashboard?.metrics?.averageRank || 'N/A'}
                subtitle="when mentioned"
                icon={Award}
                color="yellow"
              />
              <MetricCard
                title="Sentiment Score"
                value={`${dashboard?.metrics?.sentimentScore || 0}%`}
                subtitle="positive mentions"
                icon={ThumbsUp}
                color="green"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Rank Distribution */}
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h3 className="text-lg font-semibold text-dark-900 mb-6">Rank Distribution</h3>
                <div className="space-y-4">
                  {[
                    { label: '1st Rank', key: 'first', color: 'green' },
                    { label: '2nd Rank', key: 'second', color: 'primary' },
                    { label: '3rd Rank', key: 'third', color: 'yellow' },
                    { label: '4th+ Rank', key: 'other', color: 'accent' },
                  ].map(({ label, key, color }) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-600">{label}</span>
                        <span className="font-medium text-dark-900">
                          {dashboard?.rankDistribution?.[key] || 0}
                        </span>
                      </div>
                      <ProgressBar
                        value={dashboard?.rankDistribution?.[key] || 0}
                        max={dashboard?.metrics?.answersMentioned || 1}
                        color={color}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h3 className="text-lg font-semibold text-dark-900 mb-6">Sentiment Distribution</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Positive', key: 'positive', color: 'green', icon: ThumbsUp },
                    { label: 'Neutral', key: 'neutral', color: 'yellow', icon: Minus },
                    { label: 'Negative', key: 'negative', color: 'red', icon: ThumbsDown },
                  ].map(({ label, key, color, icon: Icon }) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-600 flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </span>
                        <span className="font-medium text-dark-900">
                          {dashboard?.sentimentDistribution?.[key] || 0}
                        </span>
                      </div>
                      <ProgressBar
                        value={dashboard?.sentimentDistribution?.[key] || 0}
                        max={dashboard?.metrics?.answersMentioned || 1}
                        color={color}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Query Summary */}
            <div className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900">Query Summary</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-dark-500">
                    {dashboard?.querySummary?.total || 0} total queries
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Completed', value: dashboard?.querySummary?.completed || 0, color: 'text-green-600', bg: 'bg-green-100' },
                  { label: 'Pending', value: dashboard?.querySummary?.pending || 0, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                  { label: 'Processing', value: dashboard?.querySummary?.processing || 0, color: 'text-primary-600', bg: 'bg-primary-100' },
                  { label: 'Failed', value: dashboard?.querySummary?.failed || 0, color: 'text-red-600', bg: 'bg-red-100' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-lg p-4 text-center`}>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-sm text-dark-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Results */}
            {dashboard?.recentResults?.length > 0 && (
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h3 className="text-lg font-semibold text-dark-900 mb-6">Recent Analysis Results</h3>
                <div className="space-y-4">
                  {dashboard.recentResults.slice(0, 5).map((result) => (
                    <div
                      key={result._id}
                      className="border border-dark-100 rounded-lg p-4 hover:border-primary-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-dark-900 mb-2">{result.queryText}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`flex items-center ${result.userBrandMentioned ? 'text-green-600' : 'text-dark-400'}`}>
                              {result.userBrandMentioned ? (
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              {result.userBrandMentioned ? 'Mentioned' : 'Not Mentioned'}
                            </span>
                            {result.userBrandRank && (
                              <span className="text-dark-500">Rank #{result.userBrandRank}</span>
                            )}
                            <span className="text-dark-400">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {new Date(result.analyzedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.userBrandSentiment === 'positive'
                              ? 'bg-green-100 text-green-700'
                              : result.userBrandSentiment === 'negative'
                              ? 'bg-red-100 text-red-700'
                              : result.userBrandSentiment === 'neutral'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-dark-100 text-dark-500'
                          }`}
                        >
                          {result.userBrandSentiment || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="space-y-6 animate-fade-in">
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-dark-900">Tracked Queries</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddQuery(!showAddQuery)}
                  className="inline-flex items-center px-4 py-2 border border-dark-200 text-dark-700 rounded-lg hover:bg-dark-50 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </button>
                <button
                  onClick={generateQueries}
                  disabled={generating}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium text-sm shadow-lg shadow-primary-500/25 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Queries
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Add Custom Query Form */}
            {showAddQuery && (
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">Add Custom Query</h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    placeholder="Enter a search query..."
                    className="flex-1 px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
                  />
                  <button
                    onClick={addCustomQuery}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                  >
                    Add Query
                  </button>
                </div>
              </div>
            )}

            {/* Queries List */}
            {queries.length === 0 ? (
              <div className="bg-white rounded-xl p-12 card-shadow text-center">
                <MessageSquare className="w-12 h-12 text-dark-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">No queries yet</h3>
                <p className="text-dark-500 mb-6">Generate AI queries or add your own to start tracking</p>
                <button
                  onClick={generateQueries}
                  disabled={generating}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Queries
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl card-shadow overflow-hidden">
                <div className="divide-y divide-dark-100">
                  {queries.map((query) => {
                    const result = results.find((r) => r.queryId === query._id);
                    return (
                      <div
                        key={query._id}
                        className="p-4 hover:bg-dark-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-dark-900 mb-1">{query.query}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span
                                className={`flex items-center ${
                                  query.status === 'completed'
                                    ? 'text-green-600'
                                    : query.status === 'processing'
                                    ? 'text-primary-600'
                                    : query.status === 'failed'
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                {query.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                ) : query.status === 'processing' ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : query.status === 'failed' ? (
                                  <XCircle className="w-4 h-4 mr-1" />
                                ) : (
                                  <Clock className="w-4 h-4 mr-1" />
                                )}
                                {query.status}
                              </span>
                              {query.isCustom && (
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                                  Custom
                                </span>
                              )}
                              {result && (
                                <span className="text-dark-500">
                                  Visibility: {result.visibility}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {result?.userBrandMentioned !== undefined && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  result.latestResult?.userBrandMentioned
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-dark-100 text-dark-500'
                                }`}
                              >
                                {result.latestResult?.userBrandMentioned ? 'Mentioned' : 'Not Mentioned'}
                              </span>
                            )}
                            <button
                              onClick={() => deleteQuery(query._id)}
                              className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-dark-900">Brand Leaderboard</h2>
            
            {!dashboard?.leaderboard?.length ? (
              <div className="bg-white rounded-xl p-12 card-shadow text-center">
                <BarChart3 className="w-12 h-12 text-dark-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">No data yet</h3>
                <p className="text-dark-500">Run analysis to see the brand leaderboard</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl card-shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-dark-50 border-b border-dark-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Mentions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Visibility
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Avg Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Sentiment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {dashboard.leaderboard.map((item, index) => {
                      const isUserBrand = item.name.toLowerCase() === brand.name.toLowerCase();
                      return (
                        <tr
                          key={item.name}
                          className={`${isUserBrand ? 'bg-primary-50' : 'hover:bg-dark-50'} transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : index === 1
                                  ? 'bg-dark-200 text-dark-600'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-dark-100 text-dark-500'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`font-medium ${isUserBrand ? 'text-primary-600' : 'text-dark-900'}`}>
                              {item.name}
                              {isUserBrand && (
                                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                                  You
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-dark-600">
                            {item.mentions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-20 mr-3">
                                <ProgressBar value={item.visibility} color="primary" />
                              </div>
                              <span className="text-dark-600">{item.visibility}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-dark-600">
                            {item.avgRank || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-green-600 flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {item.sentiment?.positive || 0}
                              </span>
                              <span className="text-dark-400 flex items-center">
                                <Minus className="w-3 h-3 mr-1" />
                                {item.sentiment?.neutral || 0}
                              </span>
                              <span className="text-red-600 flex items-center">
                                <ThumbsDown className="w-3 h-3 mr-1" />
                                {item.sentiment?.negative || 0}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-dark-900">Top Cited Sources</h2>
            
            {!dashboard?.topCitations?.length ? (
              <div className="bg-white rounded-xl p-12 card-shadow text-center">
                <Link2 className="w-12 h-12 text-dark-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-900 mb-2">No citations yet</h3>
                <p className="text-dark-500">Run analysis to see which sources AI cites</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {dashboard.topCitations.map((citation, index) => (
                  <div
                    key={citation.domain}
                    className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-dark-900">{citation.domain}</h3>
                          <p className="text-sm text-dark-500">{citation.count} citations</p>
                        </div>
                      </div>
                      <a
                        href={`https://${citation.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    {citation.urls?.length > 0 && (
                      <div className="space-y-2">
                        {citation.urls.slice(0, 3).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-primary-600 hover:underline truncate"
                          >
                            {url}
                          </a>
                        ))}
                        {citation.urls.length > 3 && (
                          <p className="text-sm text-dark-400">
                            +{citation.urls.length - 3} more URLs
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
