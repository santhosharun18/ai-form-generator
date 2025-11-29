'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Form {
  _id: string;
  title: string;
  prompt: string;
  metadata: {
    category?: string;
    fieldCount?: number;
    hasImageUpload?: boolean;
    tags?: string[];
  };
  createdAt: string;
  submissionCount?: number;
}

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      fetchForms(token);
    }
  }, [router]);

  const fetchForms = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/forms/my-forms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/auth/login');
  };

  const getCategoryColor = (category: string = 'General') => {
    const colors: Record<string, string> = {
      'HR & Recruitment': 'from-purple-500 to-pink-500',
      'Education': 'from-green-500 to-teal-500',
      'Healthcare': 'from-red-500 to-orange-500',
      'Customer Service': 'from-blue-500 to-cyan-500',
      'E-commerce': 'from-yellow-500 to-orange-500',
      'Authentication': 'from-indigo-500 to-purple-500',
      'General': 'from-gray-500 to-gray-600'
    };
    return colors[category] || colors['General'];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Form Generator
                </h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/create-form"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Form
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">My Forms</h2>
          <p className="text-gray-600 text-lg">
            {forms.length === 0 ? 'Create your first AI-powered form' : `You have ${forms.length} form${forms.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Forms Grid */}
        {forms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No forms yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first AI-powered form using natural language
            </p>
            <Link
              href="/create-form"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1 group"
              >
                {/* Category Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(form.metadata?.category)}`}>
                    {form.metadata?.category || 'General'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {formatDate(form.createdAt)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                  {form.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                  {form.prompt}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">{form.metadata?.fieldCount || 0} fields</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-bold">{form.submissionCount || 0} responses</span>
                  </div>
                </div>

                {/* Tags */}
                {form.metadata?.tags && form.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.metadata.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/form/${form._id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition font-semibold text-sm"
                  >
                    View Form
                  </Link>
                  <Link
                    href={`/form/${form._id}/submissions`}
                    className="flex-1 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold text-sm shadow-md"
                  >
                    Submissions
                  </Link>
                </div>

                {/* Image Upload Indicator */}
                {form.metadata?.hasImageUpload && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-purple-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Supports file uploads</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
