'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchSubmissions(token);
  }, []);

  const fetchSubmissions = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/${params.id}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setFormTitle(data.formTitle || 'Form');
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {formTitle}
                </h1>
                <p className="text-gray-600 text-lg">
                  Total Submissions: <span className="font-bold text-blue-600">{submissions.length}</span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg">
                {submissions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Submissions */}
        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No submissions yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Share your form link to start collecting responses
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, idx) => (
              <div
                key={submission._id}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-white/50"
              >
                {/* Submission Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      #{submissions.length - idx}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Submission #{submissions.length - idx}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </div>
                </div>

                {/* Responses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Object.entries(submission.responses).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-l-4 border-blue-500">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        {key}
                      </p>
                      <p className="text-gray-800 font-medium break-words">
                        {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2"
                          >
                            View Link
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          value
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Uploaded Files */}
                {submission.imageUrls && submission.imageUrls.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Uploaded Files ({submission.imageUrls.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {submission.imageUrls.map((img: any, imgIdx: number) => (
                        <a
                          key={imgIdx}
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View File {imgIdx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {(submission.ipAddress || submission.userAgent) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {submission.ipAddress && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        IP: {submission.ipAddress}
                      </div>
                    )}
                    {submission.userAgent && (
                      <div className="flex items-center gap-2 truncate max-w-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Device: {submission.userAgent.split(' ')[0]}
                      </div>
                    )}
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
