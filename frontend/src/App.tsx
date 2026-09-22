import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ScientificNotice } from './components/ScientificNotice';
import { ImageUploader } from './components/ImageUploader';
import { ProcessingProgress } from './components/ProcessingProgress';
import { DashboardMetrics } from './components/DashboardMetrics';
import { View2DPanels } from './components/View2DPanels';
import { Terrain3DViewer } from './components/Terrain3DViewer';
import { ErrorAlert } from './components/ErrorAlert';

import type {
  ApiResponse,
  HealthResponse,
  PipelineStage,
  ColormapOption
} from './types';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colormap, setColormap] = useState<ColormapOption>('turbo');
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Fetch backend health and hardware capabilities
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data: HealthResponse = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.warn('Backend server connecting...', err);
      }
    };
    checkHealth();
  }, []);

  // Timer helper for animated progress tracking
  const startTimer = () => {
    setElapsedMs(0);
    const start = performance.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - start));
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Run image inference pipeline on an uploaded file
  const processImage = async (file: File) => {
    setErrorMessage(null);
    setPipelineStage('uploading');
    startTimer();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('colormap', colormap);
      formData.append('fast_mode', fastMode.toString());

      // Progress stage simulation for user visibility
      setTimeout(() => {
        setPipelineStage((curr) => (curr === 'uploading' ? 'estimating' : curr));
      }, 400);

      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned error status ${res.status}`);
      }

      setPipelineStage('surface');
      const data: ApiResponse = await res.json();

      setPipelineStage('generating_3d');
      setTimeout(() => {
        setApiResult(data);
        setPipelineStage('complete');
        stopTimer();
      }, 350);

    } catch (err: any) {
      stopTimer();
      setPipelineStage('error');
      setErrorMessage(err.message || 'Failed to process image.');
    }
  };

  // Run the bundled aerial remote-sensing demo
  const handleRunDemo = async () => {
    setErrorMessage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPipelineStage('uploading');
    startTimer();

    try {
      setTimeout(() => {
        setPipelineStage('estimating');
      }, 300);

      const res = await fetch(`/api/demo?colormap=${colormap}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned error status ${res.status}`);
      }

      setPipelineStage('surface');
      const data: ApiResponse = await res.json();

      setPipelineStage('generating_3d');
      setTimeout(() => {
        setApiResult(data);
        setPreviewUrl(data.images.original_rgb);
        setPipelineStage('complete');
        stopTimer();
      }, 400);

    } catch (err: any) {
      stopTimer();
      setPipelineStage('error');
      setErrorMessage(err.message || 'Failed to execute aerial demo.');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    processImage(file);
  };

  const handleReset = () => {
    stopTimer();
    setSelectedFile(null);
    if (previewUrl && !previewUrl.startsWith('data:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setApiResult(null);
    setPipelineStage('idle');
    setErrorMessage(null);
    setElapsedMs(0);
  };

  const isLoading = pipelineStage !== 'idle' && pipelineStage !== 'complete' && pipelineStage !== 'error';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header health={health} />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Scientific Principle Notice */}
        <ScientificNotice />

        {/* Error Alert */}
        <ErrorAlert
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        {/* Top Section: Upload Controls */}
        <ImageUploader
          onFileSelect={handleFileSelect}
          onRunDemo={handleRunDemo}
          colormap={colormap}
          onColormapChange={(cmap) => {
            setColormap(cmap);
            if (selectedFile) processImage(selectedFile);
            else if (apiResult) handleRunDemo();
          }}
          fastMode={fastMode}
          onFastModeChange={setFastMode}
          isLoading={isLoading}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          onReset={handleReset}
        />

        {/* Multi-Stage Pipeline Progress Tracker */}
        <ProcessingProgress stage={pipelineStage} elapsedMs={elapsedMs} />

        {/* Telemetry HUD Cards */}
        <DashboardMetrics telemetry={apiResult?.telemetry ?? null} />

        {/* 2D Diagnostic Geospatial Panels (RGB, Colorized Depth, Surface Relief) */}
        <View2DPanels images={apiResult?.images ?? null} />

        {/* Interactive 3D Terrain Flythrough WebGL Canvas */}
        <Terrain3DViewer
          meshData={apiResult?.terrain_mesh ?? null}
          images={apiResult?.images ?? null}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p>
            <span className="font-semibold text-slate-400">DepthWizard — SIH26175</span> | Single-View Height Estimation and 3D Flythrough
          </p>
          <p className="text-[11px] text-slate-600">
            Smart India Hackathon (SIH 2026) Prototype • Normalized Relative Elevation [0.0 - 1.0] • Phase 2 Metric Elevation Integration
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
