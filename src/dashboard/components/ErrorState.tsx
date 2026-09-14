import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load data',
  message,
  onRetry,
  retrying = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/70 border border-rose-200 rounded-2xl">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs text-rose-700 max-w-md mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors shadow-xs disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  );
};
