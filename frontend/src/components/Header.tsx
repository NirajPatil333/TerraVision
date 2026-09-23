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
    <header className="border-b border-slate-800/80 bg-[#0c1017]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold tracking-tight text-slate-100">
                TerraVision
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              Single-View Terrain Reconstruction & 3D Visualization
            </p>
          </div>
        </div>

        {/* Telemetry Status Pills */}
        <div className="flex items-center gap-2.5">
          {/* Model Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-medium text-slate-200">Depth Anything V2 Small</span>
          </div>

          {/* Hardware Engine Pill */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-xs"
            title={deviceName}
          >
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Compute:</span>
            <span className={`font-medium ${isCuda ? 'text-emerald-400' : 'text-slate-200'}`}>
              {isCuda ? 'CUDA GPU' : 'CPU (OpenCV DNN)'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCuda ? 'bg-emerald-500' : 'bg-cyan-400'
              }`}
            />
          </div>
        </div>

      </div>
    </header>
  );
};
