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

  // Top terrain surface geometry
  const topGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      10,
      10,
      grid_width - 1,
      grid_height - 1
    );
  }, [grid_width, grid_height]);

  // Base skirt & bottom plate geometry
  const baseGeometry = useMemo(() => {
    return new THREE.BufferGeometry();
  }, [grid_width, grid_height]);

  // Ordered perimeter vertex indices around the grid
  const perimeterIndices = useMemo(() => {
    const indices: number[] = [];
    const w = grid_width;
    const h = grid_height;

    // South edge: iy = h - 1, ix from 0 to w - 1
    for (let ix = 0; ix < w - 1; ix++) {
      indices.push((h - 1) * w + ix);
    }
    // East edge: ix = w - 1, iy from h - 1 down to 0
    for (let iy = h - 1; iy > 0; iy--) {
      indices.push(iy * w + (w - 1));
    }
    // North edge: iy = 0, ix from w - 1 down to 0
    for (let ix = w - 1; ix > 0; ix--) {
      indices.push(0 * w + ix);
    }
    // West edge: ix = 0, iy from 0 up to h - 1
    for (let iy = 0; iy < h - 1; iy++) {
      indices.push(iy * w + 0);
    }
    return indices;
  }, [grid_width, grid_height]);

  // Update vertex heights and base geometry
  useEffect(() => {
    if (!topGeometry || !baseGeometry || !height_map) return;
    const pos = topGeometry.attributes.position;
    const heightFactor = 3.6 * exaggeration;

    // Displace each terrain vertex by its relative surface elevation value
    for (let i = 0; i < pos.count; i++) {
      const h = height_map[i] ?? 0;
      pos.setZ(i, h * heightFactor);
    }
    pos.needsUpdate = true;
    topGeometry.computeVertexNormals();
    topGeometry.computeBoundingBox();
    topGeometry.computeBoundingSphere();

    // Solid vertical base underneath the terrain
    const baseZ = -0.6;
    const numPerimeter = perimeterIndices.length;
    const totalVertices = numPerimeter * 6 + 6;
    const basePositions = new Float32Array(totalVertices * 3);

    let offset = 0;

    // Side walls connecting terrain surface edges down to the base
    for (let i = 0; i < numPerimeter; i++) {
      const idxA = perimeterIndices[i];
      const idxB = perimeterIndices[(i + 1) % numPerimeter];

      const ax = pos.getX(idxA);
      const ay = pos.getY(idxA);
      const az = pos.getZ(idxA);

      const bx = pos.getX(idxB);
      const by = pos.getY(idxB);
      const bz = pos.getZ(idxB);

      // Triangle 1: (A, A_base, B)
      basePositions[offset++] = ax;
      basePositions[offset++] = ay;
      basePositions[offset++] = az;

      basePositions[offset++] = ax;
      basePositions[offset++] = ay;
      basePositions[offset++] = baseZ;

      basePositions[offset++] = bx;
      basePositions[offset++] = by;
      basePositions[offset++] = bz;

      // Triangle 2: (B, A_base, B_base)
      basePositions[offset++] = bx;
      basePositions[offset++] = by;
      basePositions[offset++] = bz;

      basePositions[offset++] = ax;
      basePositions[offset++] = ay;
      basePositions[offset++] = baseZ;

      basePositions[offset++] = bx;
      basePositions[offset++] = by;
      basePositions[offset++] = baseZ;
    }

    // Bottom plate closing the base
    const pSW = { x: pos.getX((grid_height - 1) * grid_width), y: pos.getY((grid_height - 1) * grid_width) };
    const pSE = { x: pos.getX((grid_height - 1) * grid_width + (grid_width - 1)), y: pos.getY((grid_height - 1) * grid_width + (grid_width - 1)) };
    const pNE = { x: pos.getX(grid_width - 1), y: pos.getY(grid_width - 1) };
    const pNW = { x: pos.getX(0), y: pos.getY(0) };

    // Triangle 1: (SW, NE, SE)
    basePositions[offset++] = pSW.x;
    basePositions[offset++] = pSW.y;
    basePositions[offset++] = baseZ;

    basePositions[offset++] = pNE.x;
    basePositions[offset++] = pNE.y;
    basePositions[offset++] = baseZ;

    basePositions[offset++] = pSE.x;
    basePositions[offset++] = pSE.y;
    basePositions[offset++] = baseZ;

    // Triangle 2: (SW, NW, NE)
    basePositions[offset++] = pSW.x;
    basePositions[offset++] = pSW.y;
    basePositions[offset++] = baseZ;

    basePositions[offset++] = pNW.x;
    basePositions[offset++] = pNW.y;
    basePositions[offset++] = baseZ;

    basePositions[offset++] = pNE.x;
    basePositions[offset++] = pNE.y;
    basePositions[offset++] = baseZ;

    baseGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(basePositions, 3)
    );
    baseGeometry.computeVertexNormals();
    baseGeometry.computeBoundingBox();
    baseGeometry.computeBoundingSphere();
  }, [topGeometry, baseGeometry, height_map, exaggeration, perimeterIndices, grid_width, grid_height]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Top Displaced Terrain Surface */}
      <mesh
        ref={meshRef}
        geometry={topGeometry}
        receiveShadow
        castShadow
      >
        {textureMode === 'shaded' ? (
          <meshStandardMaterial
            roughness={0.5}
            metalness={0.1}
            color="#cbd5e1"
            wireframe={wireframe}
            flatShading={false}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            map={texture ?? undefined}
            roughness={0.55}
            metalness={0.08}
            wireframe={wireframe}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Solid Vertical Base & Side Walls */}
      <mesh
        geometry={baseGeometry}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.85}
          metalness={0.15}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const Terrain3DViewer: React.FC<Terrain3DViewerProps> = ({ meshData, images }) => {
  const controlsRef = useRef<any>(null);
  const [exaggeration, setExaggeration] = useState<number>(1.5);
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
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 h-[500px] flex flex-col items-center justify-center">
        <Box className="w-10 h-10 mb-3 text-slate-600" />
        <h4 className="text-sm font-semibold text-slate-300">Interactive 3D Terrain Flythrough</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Awaiting depth and relative surface matrix to synthesize 3D polygonal terrain mesh.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
      {/* 3D Viewer Header Controls Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-100">
            Interactive 3D Terrain Flythrough
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Three.js / WebGL
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Texture Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => setTextureMode('rgb')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                textureMode === 'rgb' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite RGB
            </button>
            <button
              onClick={() => setTextureMode('depth')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                textureMode === 'depth' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Depth Map
            </button>
            <button
              onClick={() => setTextureMode('shaded')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                textureMode === 'shaded' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shaded Relief
            </button>
          </div>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              wireframe
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/70'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Wireframe
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-slate-800 text-emerald-300 border-emerald-500/70'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            Auto Rotate
          </button>

          {/* Toggle Ground Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              showGrid
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle ground reference grid"
          >
            <GridIcon className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={handleResetCamera}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 active:scale-95"
            title="Reset Orbit Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Camera
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div className="relative h-[550px] w-full bg-[#070b14]">
        <Canvas
          shadows
          camera={{ position: [8.5, 7.0, 9.5], fov: 42 }}
          className="cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#070b14']} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[12, 16, 8]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, 10, -8]} intensity={0.5} color="#94a3b8" />
          <directionalLight position={[0, -6, 0]} intensity={0.2} color="#334155" />

          {/* Reference ground grid */}
          {showGrid && (
            <Grid
              position={[0, -0.01, 0]}
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

          {/* Centered Terrain Mesh with Solid Base */}
          <Center bottom cacheKey={`${exaggeration}-${meshData.grid_width}-${meshData.height_map?.length}`}>
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
            maxPolarAngle={Math.PI / 2 - 0.02}
            target={[0, 1.2, 0]}
          />
        </Canvas>

        {/* Visual Height Exaggeration Slider Control (HUD Overlay) */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 p-3 rounded-lg border border-slate-800 max-w-xs sm:max-w-sm space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Visual Height Exaggeration</span>
            </div>
            <span className="font-mono text-cyan-400 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs">
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
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.1× Subtle</span>
            <span>1.0× Nominal</span>
            <span>3.5× Pronounced</span>
          </div>

          <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
            *Visual enhancement multiplier only. Does not alter scientific relative elevation matrix.
          </p>
        </div>

        {/* OrbitControls Mouse Helper HUD */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1 bg-slate-950/90 px-3 py-2 rounded-md border border-slate-800 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-medium">Left Click + Drag:</span> Rotate View
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-medium">Scroll Wheel:</span> Zoom In / Out
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-medium">Right Click + Drag:</span> Pan Terrain
          </div>
        </div>

      </div>
    </div>
  );
};
