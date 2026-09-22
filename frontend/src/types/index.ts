export type PipelineStage = 
  | 'idle'
  | 'uploading'
  | 'estimating'
  | 'surface'
  | 'generating_3d'
  | 'complete'
  | 'error';

export type ColormapOption = 'turbo' | 'inferno' | 'viridis' | 'magma';
export type TextureMode = 'rgb' | 'depth' | 'shaded';
export type ResolutionMode = 'standard' | 'fast';

export interface SurfaceStats {
  unit: string;
  min_relative_elevation: number;
  max_relative_elevation: number;
  mean_relative_elevation: number;
  std_relative_elevation: number;
  is_metric: boolean;
  elevation_notice: string;
}

export interface TelemetryData {
  image_width: number;
  image_height: number;
  inference_latency_ms: number;
  total_latency_ms: number;
  device: string;
  model: string;
  mesh_vertices: number;
  mesh_triangles: number;
  surface_stats: SurfaceStats;
}

export interface ImagesData {
  original_rgb: string;
  depth_colormap: string;
  surface_grayscale: string;
}

export interface TerrainMeshData {
  grid_width: number;
  grid_height: number;
  vertices_count: number;
  triangles_count: number;
  height_map: number[];
}

export interface ScientificNoticeData {
  is_relative: boolean;
  unit: string;
  message: string;
}

export interface ApiResponse {
  status: string;
  telemetry: TelemetryData;
  images: ImagesData;
  terrain_mesh: TerrainMeshData;
  scientific_notice: ScientificNoticeData;
}

export interface HealthResponse {
  status: string;
  project: string;
  device: {
    has_cuda: boolean;
    device_name: string;
    backend: string;
  };
  model: string;
  pipeline_ready: boolean;
}
