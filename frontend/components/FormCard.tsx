import Link from 'next/link';
import { Form } from '@/lib/types';

interface FormCardProps {
  form: Form;
}

export default function FormCard({ form }: FormCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'HR & Recruitment': 'bg-purple-100 text-purple-800',
      'Education': 'bg-green-100 text-green-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Customer Service': 'bg-blue-100 text-blue-800',
      'E-commerce': 'bg-yellow-100 text-yellow-800',
      'Authentication': 'bg-indigo-100 text-indigo-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
          {form.title}
        </h3>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(form.metadata?.category || 'General')}`}>
          {form.metadata?.category || 'General'}
        </span>
      </div>

      {/* Prompt */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {form.prompt}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{form.metadata?.fieldCount || 0} fields</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-medium text-blue-600">{form.submissionCount || 0} submissions</span>
        </div>
      </div>

      {/* Tags */}
      {form.metadata?.tags && form.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {form.metadata.tags.slice(0, 3).map((tag: string, idx: number) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/form/${form._id}`}
          className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          View Form
        </Link>
        <Link
          href={`/form/${form._id}/submissions`}
          className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Submissions
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-
