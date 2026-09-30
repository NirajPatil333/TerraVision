import React, { useState } from 'react';
import { Download, Eye, Layers } from 'lucide-react';
import type { ImagesData } from '../types';

interface View2DPanelsProps {
  images: ImagesData | null;
}

export const View2DPanels: React.FC<View2DPanelsProps> = ({ images }) => {
  const [activeTab, setActiveTab] = useState<'split' | 'rgb' | 'depth' | 'surface'>('split');

  if (!images) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">2D Diagnostic Analysis</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload an aerial or satellite scene to inspect high-resolution 2D elevation diagnostics
        </p>
      </div>
    );
  }

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in">
      {/* Header & Segmented Pill Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2D Elevation Diagnostic Panels
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Multi-spectral RGB, relative depth colormap, and shaded relief
            </p>
          </div>
        </div>

        {/* View Mode Tabs (Segmented pills) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200/60 dark:border-slate-800">
          {(['split', 'rgb', 'depth', 'surface'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'split' ? 'Side-by-Side' : tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Panels Layout */}
      <div className={`grid gap-4 ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        
        {/* Panel 1: Original RGB Image */}
        {(activeTab === 'split' || activeTab === 'rgb') && (
          <div className="flex flex-col space-y-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                Optical RGB Satellite
              </span>
              <button
                onClick={() => downloadImage(images.original_rgb, 'original_rgb.jpg')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 transition-all active:scale-95"
                title="Download RGB"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800 bg-black/5 dark:bg-black/40 aspect-square flex items-center justify-center">
              <img
                src={images.original_rgb}
                alt="Original RGB"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
              Source optical sensor channel
            </p>
          </div>
        )}

        {/* Panel 2: Relative Depth Colormap */}
        {(activeTab === 'split' || activeTab === 'depth') && (
          <div className="flex flex-col space-y-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Relative Depth Map
              </span>
              <button
                onClick={() => downloadImage(images.depth_colormap, 'relative_depth_map.jpg')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 transition-all active:scale-95"
                title="Download Depth Map"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800 bg-black/5 dark:bg-black/40 aspect-square flex items-center justify-center">
              <img
                src={images.depth_colormap}
                alt="Colorized Relative Depth"
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Colorbar Scale Legend */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-600 shadow-xs"></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>0.00 (Base)</span>
                <span>0.50</span>
                <span>1.00 (Peak)</span>
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Relative Surface Relief (Grayscale) */}
        {(activeTab === 'split' || activeTab === 'surface') && (
          <div className="flex flex-col space-y-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Surface Relief Model
              </span>
              <button
                onClick={() => downloadImage(images.surface_grayscale, 'surface_relief.jpg')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 transition-all active:scale-95"
                title="Download Surface Relief"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800 bg-black/5 dark:bg-black/40 aspect-square flex items-center justify-center">
              <img
                src={images.surface_grayscale}
                alt="Relative Surface Relief"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Grayscale Legend */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-black via-gray-500 to-white border border-slate-200 dark:border-slate-800"></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>0.0 (Trough)</span>
                <span>1.0 (Ridge)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
