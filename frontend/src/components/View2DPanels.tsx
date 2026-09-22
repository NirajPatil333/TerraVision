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
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">No imagery loaded</p>
        <p className="text-xs text-slate-600 mt-1">Upload an image or run demo to inspect 2D analysis views</p>
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl space-y-3">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            2D Geospatial Diagnostic Views
          </h3>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          {(['split', 'rgb', 'depth', 'surface'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
          <div className="flex flex-col space-y-2 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Original Remote Sensing RGB
              </span>
              <button
                onClick={() => downloadImage(images.original_rgb, 'original_rgb.jpg')}
                className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                title="Download RGB"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-square flex items-center justify-center">
              <img
                src={images.original_rgb}
                alt="Original RGB"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">Uncalibrated optical satellite sensor channel</p>
          </div>
        )}

        {/* Panel 2: Relative Depth Map (Colorized) */}
        {(activeTab === 'split' || activeTab === 'depth') && (
          <div className="flex flex-col space-y-2 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Relative Depth / Disparity Map
              </span>
              <button
                onClick={() => downloadImage(images.depth_colormap, 'relative_depth_map.jpg')}
                className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                title="Download Depth Map"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-square flex items-center justify-center">
              <img
                src={images.depth_colormap}
                alt="Colorized Relative Depth"
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Colorbar Scale Legend */}
            <div className="space-y-1 pt-1">
              <div className="h-2.5 w-full rounded-sm bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-600 shadow-inner"></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0.00 (Base Level)</span>
                <span>0.50</span>
                <span>1.00 (Elevated)</span>
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Relative Surface Elevation (Grayscale Relief) */}
        {(activeTab === 'split' || activeTab === 'surface') && (
          <div className="flex flex-col space-y-2 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Relative Surface Relief Model
              </span>
              <button
                onClick={() => downloadImage(images.surface_grayscale, 'surface_relief.jpg')}
                className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
                title="Download Surface Relief"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-square flex items-center justify-center">
              <img
                src={images.surface_grayscale}
                alt="Relative Surface Relief"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Grayscale Scale Legend */}
            <div className="space-y-1 pt-1">
              <div className="h-2.5 w-full rounded-sm bg-gradient-to-r from-black via-gray-500 to-white shadow-inner border border-slate-800"></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Low Surface (0.0)</span>
                <span>High Peak (1.0)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
