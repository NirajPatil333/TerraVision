import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileImage,
  Layers,
  Zap,
} from 'lucide-react';
import type { ColormapOption } from '../types';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onRunDemo: () => void;
  colormap: ColormapOption;
  onColormapChange: (cmap: ColormapOption) => void;
  fastMode: boolean;
  onFastModeChange: (fast: boolean) => void;
  isLoading: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onReset: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  onRunDemo,
  colormap,
  onColormapChange,
  fastMode,
  onFastModeChange,
  isLoading,
  selectedFile,
  previewUrl,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndPassFile = (file: File) => {
    setFileError(null);
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validExtensions.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setFileError('Supported formats: JPG, JPEG, PNG, WEBP.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds 25 MB limit.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero Banner inspired by the reference image gradient banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/90 via-pink-500/80 to-purple-700/90 text-white p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative geometry */}
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Geospatial Elevation AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Single-View Height Estimation & 3D Terrain Flythrough
            </h1>
            <p className="text-white/90 text-xs sm:text-sm font-normal leading-relaxed">
              Convert any single optical satellite or aerial RGB image into a relative depth matrix,
              elevation relief model, and an interactive 3D WebGL terrain mesh.
            </p>
          </div>

          {/* Quick Stats / Feature Pills in Banner */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-medium text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Relative Relief [0.0 - 1.0]</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-medium text-white">
              <Layers className="w-4 h-4 text-cyan-200" />
              <span>128×128 Terrain Mesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Flat Control Bar (Matching the pill search bar in the reference image) */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Segment 1: Upload / Active File Indicator */}
          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-850 cursor-pointer border border-slate-200/60 dark:border-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <FileImage className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Imagery Input
              </div>
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {selectedFile ? selectedFile.name : 'Select or drop aerial / satellite image'}
              </div>
            </div>
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 shrink-0">
              Browse
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {/* Segment 2: Colormap Pill Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pl-1 pr-1 hidden sm:inline">
              Colormap:
            </span>
            {(['turbo', 'inferno', 'viridis', 'magma'] as ColormapOption[]).map((cmap) => (
              <button
                key={cmap}
                onClick={() => onColormapChange(cmap)}
                disabled={isLoading}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                  colormap === cmap
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cmap}
              </button>
            ))}
          </div>

          {/* Segment 3: Resolution Pill Toggle */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => onFastModeChange(!fastMode)}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                fastMode
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${fastMode ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{fastMode ? 'Fast (266px)' : 'Standard (392px)'}</span>
            </button>
          </div>

          {/* Segment 4: Action Buttons (Deep purple flat button matching reference image) */}
          <div className="flex items-center gap-2">
            {/* Try Demo Button */}
            <button
              onClick={onRunDemo}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Try Demo</span>
            </button>

            {/* Reset Button */}
            {previewUrl && (
              <button
                onClick={onReset}
                disabled={isLoading}
                title="Reset session"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Drop Zone Area (Clean flat card) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-purple-300 dark:hover:border-slate-700'
        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {previewUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl">
            <div className="relative w-40 h-32 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
              <img
                src={previewUrl}
                alt="Selected Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Image Ready</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                {selectedFile ? selectedFile.name : 'Sample Aerial Remote-Sensing Scene'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click or drag another image to replace. The 3D elevation pipeline processes automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3 py-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Drop your satellite or aerial image here, or <span className="text-purple-600 dark:text-purple-400 underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports JPG, JPEG, PNG, WEBP • Maximum 25 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {fileError && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium animate-fade-in flex items-center gap-2">
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
};
