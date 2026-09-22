import React from 'react';
import { Mountain, Cpu, Zap, Compass } from 'lucide-react';
import type { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
}

export const Header: React.FC<HeaderProps> = ({ health }) => {
  const isCuda = health?.device?.has_cuda ?? false;
  const deviceName = health?.device?.device_name ?? 'Detecting hardware...';

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Mountain className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                DepthWizard
              </span>
              <span className="text-xs px-2 py-0.5 font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 tracking-wide">
                SIH26175
              </span>
              <span className="text-xs px-2 py-0.5 font-semibold rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                SIH 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Single-View Height Estimation & Interactive 3D Flythrough
            </p>
          </div>
        </div>

        {/* Telemetry Status Pills */}
        <div className="flex items-center gap-2.5">
          {/* Model Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-400">Model:</span>
            <span className="font-medium text-slate-200">Depth Anything V2 Small</span>
          </div>

          {/* Hardware Engine Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs" title={deviceName}>
            <Cpu className={`w-3.5 h-3.5 ${isCuda ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span className="font-mono text-slate-400">Compute:</span>
            <span className={`font-medium ${isCuda ? 'text-emerald-400' : 'text-cyan-300'}`}>
              {isCuda ? 'CUDA GPU' : 'CPU (OpenCV DNN)'}
            </span>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCuda ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isCuda ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
