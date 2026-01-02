import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Search, 
  TrendingUp, 
  BarChart2, 
  Zap, 
  ArrowRight, 
  Plus, 
  Globe, 
  Tag 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-dark-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-dark-900">AI Visibility Tracker</span>
            </div>
            <Link
              href="/brand/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium text-sm shadow-lg shadow-primary-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-transparent to-accent-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-dark-900 mb-6">
              Track Your Brand's
              <span className="text-gradient"> AI Visibility</span>
            </h1>
            <p className="text-xl text-dark-500 mb-10">
              Discover how often your brand appears in AI search results. Monitor mentions, 
              track competitors, and optimize your AI visibility score.
            </p>
            <Link
              href="/brand/new"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all duration-200 font-semibold text-lg shadow-xl shadow-primary-500/30 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white rounded-2xl p-8 card-shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">AI Query Tracking</h3>
              <p className="text-dark-500">
                Generate relevant queries and track how AI mentions your brand in search results.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 card-shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-xl bg-accent-100 flex items-center justify-center mb-6">
                <BarChart2 className="w-7 h-7 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Visibility Analytics</h3>
              <p className="text-dark-500">
                Get detailed metrics on visibility score, sentiment, and ranking compared to competitors.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 card-shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Citation Insights</h3>
              <p className="text-dark-500">
                Discover which pages get cited by AI and optimize your content strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-dark-900">Your Brands</h2>
            <Link
              href="/brand/new"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 card-shadow animate-pulse">
                  <div className="h-6 bg-dark-100 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-dark-100 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-dark-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl card-shadow">
              <div className="w-20 h-20 rounded-full bg-dark-50 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-dark-300" />
              </div>
              <h3 className="text-xl font-semibold text-dark-900 mb-2">No brands yet</h3>
              <p className="text-dark-500 mb-6">Add your first brand to start tracking AI visibility</p>
              <Link
                href="/brand/new"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Brand
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brand/${brand._id}`}
                  className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <ArrowRight className="w-5 h-5 text-dark-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {brand.name}
                  </h3>
                  <div className="flex items-center text-sm text-dark-500 mb-2">
                    <Globe className="w-4 h-4 mr-2" />
                    {brand.website}
                  </div>
                  <div className="flex items-center text-sm text-dark-500">
                    <Tag className="w-4 h-4 mr-2" />
                    {brand.category}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">AI Visibility Tracker</span>
            </div>
            <p className="text-dark-400 text-sm">
              © 2026 AI Visibility Tracker. Built for the Writesonic Challenge.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
