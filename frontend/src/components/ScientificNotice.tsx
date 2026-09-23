import React from 'react';
import { Info, Layers, Target } from 'lucide-react';

export const ScientificNotice: React.FC = () => {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded bg-slate-800 text-slate-400 mt-0.5 shrink-0">
          <Info className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-200 text-xs">
              ANALYSIS NOTE
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700/60">
              Relative Surface · 0–1
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            Single monocular RGB inputs (JPG/PNG) provide relative topological relief cues. 
            All elevation maps and 3D terrain meshes generated herein represent 
            <span className="text-cyan-300 font-medium"> relative surface reconstruction only</span>. 
            In compliance with remote sensing standards, no synthetic metric heights (meters) or uncalibrated ground accuracy claims are simulated.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Phase 2 Roadmap: Ground Control Point (GCP) Georeferencing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Phase 2 Roadmap: SRTM DEM & LiDAR Metric Elevation Calibration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
