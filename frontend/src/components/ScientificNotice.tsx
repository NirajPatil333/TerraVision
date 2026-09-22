import React from 'react';
import { Info, Layers, Target } from 'lucide-react';

export const ScientificNotice: React.FC = () => {
  return (
    <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-cyan-900/40 text-cyan-400 mt-0.5 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px]">
              Scientific Principle & Relative Surface Notice
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-mono text-[10px]">
              Strict Normalized Representation [0.0 - 1.0]
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Single monocular RGB inputs (JPG/PNG) provide relative topological relief cues. 
            All elevation maps and 3D terrain meshes generated herein represent 
            <span className="text-cyan-300 font-medium"> relative surface reconstruction only</span>. 
            In compliance with remote sensing standards, no synthetic metric heights (meters) or uncalibrated ground accuracy claims are simulated.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Phase 2 Roadmap: Ground Control Point (GCP) Georeferencing</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Phase 2 Roadmap: SRTM DEM & LiDAR Metric Elevation Calibration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
