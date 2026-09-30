import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/50 p-4 shadow-xs flex items-start justify-between gap-3 text-rose-800 dark:text-rose-200 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider text-[11px]">
            Inference Alert
          </div>
          <p className="leading-relaxed text-rose-700 dark:text-rose-300 font-medium">{message}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 p-1 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
