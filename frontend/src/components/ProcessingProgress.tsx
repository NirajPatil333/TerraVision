import React from 'react';
import {
  Upload,
  BrainCircuit,
  Waves,
  Cuboid,
  CheckCircle2,
  AlertCircle,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { PipelineStage } from '../types';

interface ProcessingProgressProps {
  stage: PipelineStage;
  elapsedMs?: number;
}

interface StageItem {
  key: PipelineStage;
  label: string;
  sublabel: string;
  icon: LucideIcon;
}

const STAGES: StageItem[] = [
  { key: 'uploading', label: 'Image Payload', sublabel: 'Validation', icon: Upload },
  { key: 'estimating', label: 'Depth Estimation', sublabel: 'Depth Anything V2', icon: BrainCircuit },
  { key: 'surface', label: 'Surface Model', sublabel: 'Relative [0–1]', icon: Waves },
  { key: 'generating_3d', label: '3D Polygonal Mesh', sublabel: '128×128 Grid', icon: Cuboid },
  { key: 'complete', label: 'Complete', sublabel: 'Ready to Explore', icon: CheckCircle2 },
];

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ stage, elapsedMs }) => {
  if (stage === 'idle') return null;

  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const isError = stage === 'error';

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Pipeline Execution
          </span>
        </div>
        {elapsedMs !== undefined && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {isError ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>An error occurred during terrain processing. Please check details below.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentIdx > idx || stage === 'complete';
            const isActive = currentIdx === idx && stage !== 'complete';

            return (
              <div
                key={s.key}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-white dark:bg-[#111827] border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">
                  {s.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {s.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
