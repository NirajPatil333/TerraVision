"""
DepthWizard - Relative Surface Reconstruction & Elevation Matrix Generator
Strict Scientific Principle: Strictly relative [0.0, 1.0] representation.
No fabricated metric units (meters) or pseudo-DEM ground-truth claims.
"""
import cv2
import numpy as np
from app.config import MESH_GRID_SIZE

def normalize_relative_surface(raw_depth: np.ndarray) -> tuple[np.ndarray, dict]:
    """
    Normalize raw depth/disparity predictions into a scientific relative surface [0.0, 1.0].
    
    In monocular remote-sensing / aerial imagery:
    - Higher disparity / inverse-depth values correspond to elevated surface structures 
      (closer to nadir satellite sensor: rooftops, tree canopies, hills).
    - Lower values correspond to ground terrain, road levels, and water bodies.
    
    Returns:
        relative_surface: float32 array in range [0.0, 1.0]
        surface_telemetry: statistical summary of relative distribution
    """
    depth_min = float(np.min(raw_depth))
    depth_max = float(np.max(raw_depth))
    
    depth_range = depth_max - depth_min
    if depth_range <= 1e-6:
        # Uniform flat plane fallback
        relative_surface = np.zeros_like(raw_depth, dtype=np.float32)
    else:
        relative_surface = (raw_depth - depth_min) / depth_range

    relative_surface = np.clip(relative_surface, 0.0, 1.0).astype(np.float32)

    surface_telemetry = {
        "unit": "normalized_relative_units [0.0 - 1.0]",
        "min_relative_elevation": 0.0,
        "max_relative_elevation": 1.0,
        "mean_relative_elevation": round(float(np.mean(relative_surface)), 4),
        "std_relative_elevation": round(float(np.std(relative_surface)), 4),
        "is_metric": False,
        "elevation_notice": "Strictly relative elevation model. Absolute metric calibration (meters) requires Phase 2 GCP / LiDAR integration."
    }

    return relative_surface, surface_telemetry


def generate_terrain_mesh_grid(relative_surface: np.ndarray, grid_size: int = MESH_GRID_SIZE) -> dict:
    """
    Generates a downsampled elevation grid optimized for high-performance WebGL 3D rendering.
    
    Args:
        relative_surface: 2D float32 array of relative heights [0.0 - 1.0].
        grid_size: Number of vertices along width and height (e.g., 128).
        
    Returns:
        Dictionary with grid dimensions, vertex count, triangle count, and flattened 1D elevation array.
    """
    # Resize to grid_size x grid_size
    grid = cv2.resize(relative_surface, (grid_size, grid_size), interpolation=cv2.INTER_AREA)
    
    vertices_count = grid_size * grid_size
    triangles_count = (grid_size - 1) * (grid_size - 1) * 2

    return {
        "grid_width": grid_size,
        "grid_height": grid_size,
        "vertices_count": vertices_count,
        "triangles_count": triangles_count,
        # Flattened row-major list of relative heights [0.0 - 1.0] rounded to 4 decimals
        "height_map": [round(float(val), 4) for val in grid.flatten()]
    }
