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
  Compass
} from 'lucide-react';
import type { TerrainMeshData, ImagesData, TextureMode } from '../types';

interface Terrain3DViewerProps {
  meshData: TerrainMeshData | null;
  images: ImagesData | null;
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

  // Create plane geometry and displace heights
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
      // In Three.js PlaneGeometry, Z is perpendicular to the plane
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

export const Terrain3DViewer: React.FC<Terrain3DViewerProps> = ({ meshData, images }) => {
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

  // Select texture URL based on mode
  const activeTextureUrl = useMemo(() => {
    if (!images) return null;
    if (textureMode === 'rgb') return images.original_rgb;
    if (textureMode === 'depth') return images.depth_colormap;
    return null;
  }, [images, textureMode]);

  if (!meshData) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-500 h-[500px] flex flex-col items-center justify-center">
        <Box className="w-12 h-12 mb-3 text-slate-700 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-400">Interactive 3D Terrain Flythrough</h4>
        <p className="text-xs text-slate-600 mt-1 max-w-sm">
          Awaiting depth and relative surface matrix to synthesize 3D polygonal terrain mesh.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden flex flex-col">
      {/* 3D Viewer Header Controls Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive 3D Terrain Flythrough
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            Three.js / WebGL 60 FPS
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Texture Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setTextureMode('rgb')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                textureMode === 'rgb' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite RGB
            </button>
            <button
              onClick={() => setTextureMode('depth')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                textureMode === 'depth' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Depth Map
            </button>
            <button
              onClick={() => setTextureMode('shaded')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                textureMode === 'shaded' ? 'bg-indigo-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shaded Relief
            </button>
          </div>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              wireframe
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/70'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Wireframe
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            Auto Rotate
          </button>

          {/* Toggle Ground Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              showGrid
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle ground reference grid"
          >
            <GridIcon className="w-4 h-4" />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={handleResetCamera}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition flex items-center gap-1.5 active:scale-95"
            title="Reset Orbit Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Camera
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div className="relative h-[550px] w-full bg-slate-950">
        <Canvas
          shadows
          camera={{ position: [8, 9, 10], fov: 45 }}
          className="cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#070b14']} />
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[12, 18, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, 8, -10]} intensity={0.4} color="#60a5fa" />

          {/* Reference ground grid */}
          {showGrid && (
            <Grid
              position={[0, -0.05, 0]}
              args={[16, 16]}
              cellSize={1}
              cellThickness={1}
              cellColor="#1e293b"
              sectionSize={4}
              sectionThickness={1.5}
              sectionColor="#334155"
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

          {/* Orbit Controls (Rotate, Zoom, Pan) */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            enableDamping
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={35}
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going underneath terrain
          />
        </Canvas>

        {/* Visual Height Exaggeration Slider Control (HUD Overlay) */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shadow-xl max-w-xs sm:max-w-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Visual Height Exaggeration</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-900/60 text-xs">
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
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.1× Subtle</span>
            <span>1.0× Nominal</span>
            <span>3.5× Pronounced</span>
          </div>

          <p className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 italic">
            *Visual enhancement multiplier only. Does not alter scientific relative elevation matrix.
          </p>
        </div>

        {/* OrbitControls Mouse Helper HUD */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">Left Click + Drag:</span> Rotate View
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">Scroll Wheel:</span> Zoom In / Out
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">Right Click + Drag:</span> Pan Terrain
          </div>
        </div>

      </div>
    </div>
  );
};
