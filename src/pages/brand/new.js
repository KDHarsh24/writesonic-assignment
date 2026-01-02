import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  Tag, 
  FileText, 
  Users, 
  Hash,
  Loader2,
  Check
} from 'lucide-react';

export default function NewBrand() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    category: '',
    description: '',
    competitors: '',
    keywords: '',
  });

  const categories = [
    'CRM Software',
    'Project Management',
    'Marketing Tools',
    'E-commerce',
    'Analytics',
    'Design Tools',
    'Communication',
    'Cloud Services',
    'AI/ML Tools',
    'Developer Tools',
    'Finance',
    'HR Software',
    'Education',
    'Healthcare',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.website || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          competitors: formData.competitors
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
          keywords: formData.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create brand');
      }

      // Redirect to brand page
      router.push(`/brand/${data.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-dark-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/"
              className="inline-flex items-center text-dark-500 hover:text-dark-700 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-dark-900">Add New Brand</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl card-shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Brand Details</h2>
            <p className="text-dark-500">
              Enter your brand information to start tracking AI visibility
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Brand Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Writesonic"
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website URL *
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g., https://writesonic.com"
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none bg-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your brand/product"
                rows={3}
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none resize-none"
              />
            </div>

            {/* Competitors */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Competitors (Optional)
              </label>
              <input
                type="text"
                name="competitors"
                value={formData.competitors}
                onChange={handleChange}
                placeholder="e.g., Jasper, Copy.ai, Rytr (comma-separated)"
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
              />
              <p className="mt-1 text-sm text-dark-400">Separate multiple competitors with commas</p>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Keywords (Optional)
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., AI writing, content generation, copywriting (comma-separated)"
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
              />
              <p className="mt-1 text-sm text-dark-400">Separate multiple keywords with commas</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold text-lg shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Brand...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Create Brand & Continue
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
