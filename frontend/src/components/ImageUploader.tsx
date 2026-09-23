import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileWarning, RefreshCw } from 'lucide-react';
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
      setFileError('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.');
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
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Input Remote-Sensing Imagery
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Single-view satellite or aerial RGB imagery (JPG, JPEG, PNG)
          </p>
        </div>

        {/* Demo Button */}
        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Try Demo (Satellite Aerial Scene)
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-cyan-500 bg-slate-900/90'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="space-y-3 flex flex-col items-center">
            <div className="relative rounded-md overflow-hidden border border-slate-700 max-h-48 max-w-xs">
              <img
                src={previewUrl}
                alt="Selected Preview"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                <span className="text-[11px] font-mono text-cyan-300 truncate">
                  {selectedFile ? selectedFile.name : 'Sample Aerial Remote-Sensing Scene'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">Click or drag a new image to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 py-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-1">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xs text-slate-300 font-medium">
              <span className="text-cyan-400 hover:underline">Click to browse</span> or drag and drop image here
            </div>
            <p className="text-[11px] text-slate-400">
              Supports JPG, JPEG, PNG, WEBP • Max 25 MB
            </p>
          </div>
        )}
      </div>

      {fileError && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
          <FileWarning className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Pipeline Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Colormap Selector */}
        <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-950/50 border border-slate-800">
          <span className="text-xs text-slate-300">Depth Colormap:</span>
          <div className="flex items-center gap-1.5">
            {(['turbo', 'inferno', 'viridis', 'magma'] as ColormapOption[]).map((cmap) => (
              <button
                key={cmap}
                onClick={(e) => {
                  e.stopPropagation();
                  onColormapChange(cmap);
                }}
                disabled={isLoading}
                className={`px-2 py-1 rounded text-[11px] font-mono capitalize transition-colors ${
                  colormap === cmap
                    ? 'bg-cyan-600 text-white font-medium shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cmap}
              </button>
            ))}
          </div>
        </div>

        {/* Speed / Quality Mode */}
        <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-950/50 border border-slate-800">
          <span className="text-xs text-slate-300">Inference Mode:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFastModeChange(!fastMode)}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                fastMode
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              {fastMode ? '⚡ Fast Mode (266px)' : 'Standard (392px)'}
            </button>
            {previewUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                disabled={isLoading}
                title="Reset session"
                className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
