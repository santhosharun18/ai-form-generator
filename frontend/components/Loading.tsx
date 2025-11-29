interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Pulsing circle */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-200 rounded-full animate-ping opacity-20"></div>
      </div>
      
      <p className="mt-6 text-gray-600 font-medium">{message}</p>
      
      {/* Animated dots */}
      <div className="flex gap-1 mt-3">
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
}
