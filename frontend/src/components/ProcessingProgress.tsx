import React from 'react';
import { Upload, BrainCircuit, Waves, Cuboid, CheckCircle2, AlertCircle, type LucideIcon } from 'lucide-react';
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
  { key: 'uploading', label: 'Uploading', sublabel: 'Payload validation', icon: Upload },
  { key: 'estimating', label: 'Depth Estimation', sublabel: 'Depth Anything V2', icon: BrainCircuit },
  { key: 'surface', label: 'Surface Generation', sublabel: 'Relative [0.0 - 1.0]', icon: Waves },
  { key: 'generating_3d', label: '3D Generation', sublabel: 'Mesh grid synthesis', icon: Cuboid },
  { key: 'complete', label: 'Complete', sublabel: 'Ready for analysis', icon: CheckCircle2 },
];

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ stage, elapsedMs }) => {
  if (stage === 'idle') return null;

  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const isError = stage === 'error';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pipeline Execution Flow
          </span>
          {stage !== 'complete' && !isError && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          )}
        </div>
        {elapsedMs !== undefined && (
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/50">
            {(elapsedMs / 1000).toFixed(1)}s elapsed
          </span>
        )}
      </div>

      {isError ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>An error occurred during pipeline execution. Check console or alert message below.</span>
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
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-950/50 border-cyan-500/70 shadow-lg shadow-cyan-900/20'
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-800/50 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 animate-bounce'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-cyan-300' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">
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
