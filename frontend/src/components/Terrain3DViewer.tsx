import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Sliders,
  Grid as GridIcon,
  Play,
  Pause,
  Box,
  Compass,
} from 'lucide-react';
import type { TerrainMeshData, ImagesData, TextureMode } from '../types';

interface Terrain3DViewerProps {
  meshData: TerrainMeshData | null;
  images: ImagesData | null;
  theme?: 'light' | 'dark';
}

// 3D Terrain Mesh Component
interface TerrainMeshProps {
  meshData: TerrainMeshData;
  textureUrl: string | null;
  exaggeration: number;
  wireframe: boolean;
  textureMode: TextureMode;
}

const TerrainMesh: React.FC<TerrainMeshProps> = ({
  meshData,
  textureUrl,
  exaggeration,
  wireframe,
  textureMode,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { grid_width, grid_height, height_map } = meshData;

  // Load and cache texture
  const texture = useMemo(() => {
    if (!textureUrl || textureMode === 'shaded') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureUrl);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [textureUrl, textureMode]);

  // Create plane geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      10,
      10,
      grid_width - 1,
      grid_height - 1
    );
    return geo;
  }, [grid_width, grid_height]);

  // Update vertex heights whenever exaggeration or height_map changes
  useEffect(() => {
    if (!geometry || !height_map) return;
    const pos = geometry.attributes.position;
    const heightFactor = 2.4 * exaggeration;

    for (let i = 0; i < pos.count; i++) {
      const h = height_map[i] ?? 0;
      pos.setZ(i, h * heightFactor);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [geometry, height_map, exaggeration]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      {textureMode === 'shaded' ? (
        <meshStandardMaterial
          roughness={0.65}
          metalness={0.15}
          color="#38bdf8"
          wireframe={wireframe}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshStandardMaterial
          map={texture ?? undefined}
          roughness={0.8}
          metalness={0.1}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
};

export const Terrain3DViewer: React.FC<Terrain3DViewerProps> = ({ meshData, images, theme = 'dark' }) => {
  const controlsRef = useRef<any>(null);
  const [exaggeration, setExaggeration] = useState<number>(1.2);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [textureMode, setTextureMode] = useState<TextureMode>('rgb');

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const activeTextureUrl = useMemo(() => {
    if (!images) return null;
    if (textureMode === 'rgb') return images.original_rgb;
    if (textureMode === 'depth') return images.depth_colormap;
    return null;
  }, [images, textureMode]);

  const isLight = theme === 'light';
  const canvasBgColor = isLight ? '#f1f5f9' : '#070b14';

  if (!meshData) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-12 text-center h-[520px] flex flex-col items-center justify-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
          <Box className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Interactive 3D Flythrough Viewport</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Execute inference on an aerial scene to render an interactive 3D WebGL terrain mesh.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
      {/* 3D Header Toolbar (Clean segmented controls) */}
      <div className="p-3.5 sm:px-5 bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              3D Terrain Flythrough Viewport
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hardware-accelerated Three.js WebGL surface renderer
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Shading Texture Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setTextureMode('rgb')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                textureMode === 'rgb'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Satellite RGB
            </button>
            <button
              onClick={() => setTextureMode('depth')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                textureMode === 'depth'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Depth Map
            </button>
            <button
              onClick={() => setTextureMode('shaded')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                textureMode === 'shaded'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Shaded Relief
            </button>
          </div>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
              wireframe
                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800 font-semibold'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 font-semibold'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Auto Rotate</span>
          </button>

          {/* Toggle Ground Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              showGrid
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle ground grid"
          >
            <GridIcon className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={handleResetCamera}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95"
            title="Reset Camera Vantage"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* WebGL Canvas */}
      <div className="relative h-[560px] w-full" style={{ backgroundColor: canvasBgColor }}>
        <Canvas
          shadows
          camera={{ position: [8, 9, 10], fov: 45 }}
          className="cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={[canvasBgColor]} />
          <ambientLight intensity={isLight ? 1.0 : 0.8} />
          <directionalLight
            position={[12, 18, 10]}
            intensity={isLight ? 1.8 : 1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight
            position={[-10, 8, -10]}
            intensity={isLight ? 0.6 : 0.4}
            color={isLight ? '#93c5fd' : '#60a5fa'}
          />

          {/* Reference ground grid */}
          {showGrid && (
            <Grid
              position={[0, -0.05, 0]}
              args={[16, 16]}
              cellSize={1}
              cellThickness={1}
              cellColor={isLight ? '#cbd5e1' : '#1e293b'}
              sectionSize={4}
              sectionThickness={1.5}
              sectionColor={isLight ? '#94a3b8' : '#334155'}
              fadeDistance={25}
              fadeStrength={1.2}
            />
          )}

          {/* Centered Terrain Mesh */}
          <Center top>
            <TerrainMesh
              meshData={meshData}
              textureUrl={activeTextureUrl}
              exaggeration={exaggeration}
              wireframe={wireframe}
              textureMode={textureMode}
            />
          </Center>

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            enableDamping
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={35}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>

        {/* Exaggeration Control HUD Card */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 max-w-xs sm:max-w-sm space-y-2 text-xs shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Elevation Exaggeration</span>
            </div>
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {exaggeration.toFixed(1)}×
            </span>
          </div>

          <input
            type="range"
            min="0.1"
            max="3.5"
            step="0.1"
            value={exaggeration}
            onChange={(e) => setExaggeration(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>0.1× Subtle</span>
            <span>1.0× Nominal</span>
            <span>3.5× Pronounced</span>
          </div>
        </div>

        {/* Mouse Navigation Hints HUD */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-sm">
          <span><strong className="text-slate-900 dark:text-slate-200">Left Drag:</strong> Rotate</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span><strong className="text-slate-900 dark:text-slate-200">Wheel:</strong> Zoom</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span><strong className="text-slate-900 dark:text-slate-200">Right Drag:</strong> Pan</span>
        </div>

      </div>
    </div>
  );
};
