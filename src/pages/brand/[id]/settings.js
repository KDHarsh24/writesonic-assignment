import { useState, useEffect } from 'react';
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
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function BrandSettings() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    if (id) {
      fetchBrand();
    }
  }, [id]);

  const fetchBrand = async () => {
    try {
      const res = await fetch(`/api/brands/${id}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.data.name || '',
          website: data.data.website || '',
          category: data.data.category || '',
          description: data.data.description || '',
          competitors: (data.data.competitors || []).join(', '),
          keywords: (data.data.keywords || []).join(', '),
        });
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update brand');
      }

      setSuccess('Brand updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete brand');
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-dark-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href={`/brand/${id}`}
              className="inline-flex items-center text-dark-500 hover:text-dark-700 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl card-shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Brand Settings</h2>
            <p className="text-dark-500">Update your brand information</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
              {success}
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
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none resize-none"
              />
            </div>

            {/* Competitors */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Competitors
              </label>
              <input
                type="text"
                name="competitors"
                value={formData.competitors}
                onChange={handleChange}
                placeholder="Comma-separated list"
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Keywords
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="Comma-separated list"
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-between">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium shadow-lg shadow-primary-500/25 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-dark-200">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-dark-900 mb-1">Delete Brand</h4>
                  <p className="text-sm text-dark-500">
                    Permanently delete this brand and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-dark-900 text-center mb-2">Delete Brand?</h3>
            <p className="text-dark-500 text-center mb-8">
              This will permanently delete the brand "{formData.name}" and all associated queries and analysis results.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-dark-200 text-dark-700 rounded-xl hover:bg-dark-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Brand'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
