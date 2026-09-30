import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ProcessingProgress } from './components/ProcessingProgress';
import { DashboardMetrics } from './components/DashboardMetrics';
import { View2DPanels } from './components/View2DPanels';
import { Terrain3DViewer } from './components/Terrain3DViewer';
import { ErrorAlert } from './components/ErrorAlert';
import { ShieldCheck, Mountain } from 'lucide-react';

import type {
  ApiResponse,
  HealthResponse,
  PipelineStage,
  ColormapOption,
} from './types';

export const App: React.FC = () => {
  // Theme management with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('terravision_theme') as 'light' | 'dark' | null;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [activeSection, setActiveSection] = useState<string>('studio');
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

  // Sync theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('terravision_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isLoading = pipelineStage !== 'idle' && pipelineStage !== 'complete' && pipelineStage !== 'error';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        health={health}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Error Alert */}
        <ErrorAlert
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        {/* Section 1: Studio & Upload Controls */}
        <section id="studio" className="scroll-mt-20">
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
        </section>

        {/* Multi-Stage Pipeline Progress Tracker */}
        <ProcessingProgress stage={pipelineStage} elapsedMs={elapsedMs} />

        {/* Section 2: Telemetry Metrics */}
        <section id="telemetry" className="scroll-mt-20">
          <DashboardMetrics telemetry={apiResult?.telemetry ?? null} />
        </section>

        {/* Section 3: 2D Diagnostic Geospatial Panels */}
        <section id="diagnostics" className="scroll-mt-20">
          <View2DPanels images={apiResult?.images ?? null} />
        </section>

        {/* Section 4: Interactive 3D Terrain Flythrough WebGL Canvas */}
        <section id="flythrough" className="scroll-mt-20">
          <Terrain3DViewer
            meshData={apiResult?.terrain_mesh ?? null}
            images={apiResult?.images ?? null}
            theme={theme}
          />
        </section>

      </main>

      {/* Flat Minimalist Footer */}
      {/* <footer className="mt-12 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#0c121e]/60 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">TerraVision Studio</span>
            <span>•</span>
            <span>Single-View Remote Sensing Elevation AI</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Normalized Relative Elevation [0.0, 1.0]</span>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default App;
