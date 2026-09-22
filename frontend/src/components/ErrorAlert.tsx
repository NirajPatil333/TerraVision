import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-rose-800/80 bg-rose-950/70 p-4 shadow-xl backdrop-blur-md flex items-start justify-between gap-3 text-rose-200">
      <div className="flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-rose-300 uppercase tracking-wider text-[11px]">
            Processing Error Encountered
          </div>
          <p className="leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-rose-400 hover:text-rose-200 p-1 rounded hover:bg-rose-900/50 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
