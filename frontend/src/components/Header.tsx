import React from 'react';
import { Mountain, Cpu, Zap, Sun, Moon } from 'lucide-react';
import type { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  theme,
  onToggleTheme,
  activeSection,
  onNavigate,
}) => {
  const isCuda = health?.device?.has_cuda ?? false;
  const deviceName = health?.device?.device_name ?? 'Detecting hardware...';

  const navItems = [
    { id: 'studio', label: 'Terrain Studio' },
    { id: 'diagnostics', label: '2D Analysis' },
    { id: 'flythrough', label: '3D Flythrough' },
    { id: 'telemetry', label: 'Telemetry' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Identity (Flat modern logo style matching reference) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3b1262] to-[#7c3aed] flex items-center justify-center text-white shadow-sm ring-2 ring-purple-100 dark:ring-purple-950/50">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                TerraVision
              </span>
              {/* <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                AI 3D
              </span> */}
            </div>
            {/* <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Single-View Height Estimation & Surface Reconstruction
            </p> */}
          </div>
        </div>

        {/* Minimal Navigation Tabs (Reference style: Find jobs, Company reviews, etc.) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-full border border-slate-200/60 dark:border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                activeSection === item.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compute Engine Badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
            title={deviceName}
          >
            <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline text-slate-500 dark:text-slate-400">Compute:</span>
            <span className="font-semibold">
              {isCuda ? 'CUDA' : 'CPU'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCuda ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950' : 'bg-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-950'
              }`}
            />
          </div>

          {/* Model Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">Depth Anything V2</span>
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
