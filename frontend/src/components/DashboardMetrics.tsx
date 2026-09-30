import React from 'react';
import { Maximize2, Clock, Cpu, Box, Activity, Layers, CheckCircle2 } from 'lucide-react';
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
          { label: 'Pipeline Latency', icon: Activity },
          { label: 'Mesh Vertices', icon: Layers },
          { label: 'Mesh Triangles', icon: Box },
          { label: 'Compute Engine', icon: Cpu },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">{item.label}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-slate-300 dark:text-slate-700 font-mono text-lg font-bold">--</div>
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
    surface_stats,
  } = telemetry;

  const metrics = [
    {
      label: 'Resolution',
      value: `${image_width} × ${image_height}`,
      sub: 'RGB Optical Raster',
      icon: Maximize2,
    },
    {
      label: 'Inference Time',
      value: `${inference_latency_ms.toFixed(0)} ms`,
      sub: 'Depth Anything V2',
      icon: Clock,
    },
    {
      label: 'Total Pipeline',
      value: `${(total_latency_ms / 1000).toFixed(2)} s`,
      sub: 'End-to-End Latency',
      icon: Activity,
    },
    {
      label: 'Mesh Vertices',
      value: mesh_vertices.toLocaleString(),
      sub: '128 × 128 Grid',
      icon: Layers,
    },
    {
      label: 'Mesh Triangles',
      value: mesh_triangles.toLocaleString(),
      sub: 'Polygonal Faces',
      icon: Box,
    },
    {
      label: 'Compute Engine',
      value: device.includes('CUDA') ? 'CUDA GPU' : 'CPU Engine',
      sub: 'Inference Device',
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-3">
      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs hover:border-purple-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                {item.value}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {item.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Surface Statistics Pill Bar (Style matching reference's verified badge and metadata pills) */}
      {surface_stats && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
            {/* Verified badge style from reference */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Relative Surface [0.0 - 1.0]</span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">Range:</span>
              <span className="font-mono font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {surface_stats.min_relative_elevation.toFixed(3)} – {surface_stats.max_relative_elevation.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">Mean:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {surface_stats.mean_relative_elevation.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">Std Dev:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {surface_stats.std_relative_elevation.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Normalized Elevation Matrix
          </div>
        </div>
      )}
    </div>
  );
};
