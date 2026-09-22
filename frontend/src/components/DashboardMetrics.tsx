import React from 'react';
import { Maximize2, Clock, Cpu, Box, Activity, Layers } from 'lucide-react';
import type { TelemetryData } from '../types';

interface DashboardMetricsProps {
  telemetry: TelemetryData | null;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ telemetry }) => {
  if (!telemetry) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Image Resolution', icon: Maximize2 },
          { label: 'Inference Latency', icon: Clock },
          { label: 'Total Pipeline Time', icon: Activity },
          { label: 'Mesh Vertices', icon: Layers },
          { label: 'Mesh Triangles', icon: Box },
          { label: 'Compute Engine', icon: Cpu },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-medium">{item.label}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-slate-600 font-mono text-base font-semibold">--</div>
            </div>
          );
        })}
      </div>
    );
  }

  const {
    image_width,
    image_height,
    inference_latency_ms,
    total_latency_ms,
    mesh_vertices,
    mesh_triangles,
    device,
    surface_stats
  } = telemetry;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Resolution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Resolution</span>
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-mono text-base font-bold text-slate-100">
            {image_width} <span className="text-slate-500 text-xs">×</span> {image_height}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">RGB 24-bit input</div>
        </div>

        {/* Inference Latency */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Inference Time</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono text-base font-bold text-amber-300">
            {inference_latency_ms.toFixed(0)} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Depth Anything V2</div>
        </div>

        {/* Total Latency */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Pipeline</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono text-base font-bold text-emerald-300">
            {(total_latency_ms / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-400">s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">End-to-end latency</div>
        </div>

        {/* Mesh Vertices */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mesh Vertices</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="font-mono text-base font-bold text-indigo-300">
            {mesh_vertices.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">128 × 128 height grid</div>
        </div>

        {/* Mesh Triangles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">3D Triangles</span>
            <Box className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="font-mono text-base font-bold text-purple-300">
            {mesh_triangles.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">WebGL polygon count</div>
        </div>

        {/* Compute Device */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Device</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-mono text-xs font-bold text-cyan-300 truncate" title={device}>
            {device.includes('CUDA') ? 'CUDA GPU' : 'CPU (OpenCV)'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Auto-detected engine</div>
        </div>

      </div>

      {/* Surface Telemetry Bar */}
      {surface_stats && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Relative Surface Statistics:</span>
            <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-900/60">
              Range: [{surface_stats.min_relative_elevation.toFixed(3)} - {surface_stats.max_relative_elevation.toFixed(3)}]
            </span>
            <span className="font-mono text-slate-300">
              Mean: <span className="text-emerald-400">{surface_stats.mean_relative_elevation.toFixed(3)}</span>
            </span>
            <span className="font-mono text-slate-300">
              Std Dev: <span className="text-indigo-400">{surface_stats.std_relative_elevation.toFixed(3)}</span>
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 italic">
            Unit: Non-dimensional Relative Elevation
          </div>
        </div>
      )}
    </div>
  );
};
