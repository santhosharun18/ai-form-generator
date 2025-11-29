interface SubmissionCardProps {
  submission: any;
  index: number;
  totalSubmissions: number;
}

export default function SubmissionCard({ submission, index, totalSubmissions }: SubmissionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Submission #{totalSubmissions - index}
        </h3>
        <span className="text-sm text-gray-500">
          {formatDate(submission.submittedAt)}
        </span>
      </div>

      {/* Responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {Object.entries(submission.responses).map(([key, value]: [string, any]) => (
          <div key={key} className="border-l-4 border-blue-500 pl-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {key}
            </p>
            <p className="text-gray-800 break-words">
              {typeof value === 'string' && value.startsWith('http') ? (
                <a 
                  href={value} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Link
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Uploaded Images */}
      {submission.imageUrls && submission.imageUrls.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Uploaded Files
          </p>
          <div className="flex flex-wrap gap-3">
            {submission.imageUrls.map((img: any, imgIdx: number) => (
              <a
                key={imgIdx}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
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
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-400">
        {submission.ipAddress && (
          <span>IP: {submission.ipAddress}</span>
        )}
        {submission.userAgent && (
          <span className="truncate max-w-xs">Device: {submission.userAgent.split(' ')[0]}</span>
        )}
      </div>
    </div>
  );
}
