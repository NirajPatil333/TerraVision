"""
DepthWizard - FastAPI Backend Server
Project: DepthWizard — SIH26175
Single-View Height Estimation and 3D Flythrough
"""
import time
import logging
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import DEVICE_INFO, DEFAULT_INFERENCE_SIZE, FAST_INFERENCE_SIZE
from app.depth_model import DepthAnythingV2Model
from app.surface import normalize_relative_surface, generate_terrain_mesh_grid
from app.utils import validate_and_load_image, colorize_depth_map, numpy_to_base64_data_url
from app.sample_data import get_demo_image_bytes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("depthwizard.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly initialize model on startup
    logger.info("Initializing DepthWizard AI inference pipeline...")
    try:
        DepthAnythingV2Model.get_instance()
        logger.info("Model pipeline ready.")
    except Exception as e:
        logger.error(f"Failed to preload model: {e}")
    yield
    logger.info("Shutting down DepthWizard backend.")

app = FastAPI(
    title="DepthWizard API — SIH26175",
    description="Single-View Height Estimation and 3D Terrain Reconstruction Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_pipeline(image_bytes: bytes, filename: str, colormap: str = "turbo", fast_mode: bool = False) -> dict:
    """Core pipeline execution from raw image bytes to 3D mesh grid."""
    t_start_total = time.perf_counter()

    # Stage 1: Validation & Decoding
    rgb_img = validate_and_load_image(file_bytes=image_bytes, filename=filename)
    orig_h, orig_w = rgb_img.shape[:2]

    # Stage 2: Pretrained Depth Estimation
    model = DepthAnythingV2Model.get_instance()
    inference_size = FAST_INFERENCE_SIZE if fast_mode else DEFAULT_INFERENCE_SIZE
    raw_depth, inference_ms = model.predict(rgb_img, inference_size=inference_size)

    # Stage 3: Relative Surface Normalization [0.0 - 1.0]
    relative_surface, surface_telemetry = normalize_relative_surface(raw_depth)

    # Stage 4: 2D Visual Map Generation
    colorized_depth = colorize_depth_map(relative_surface, colormap=colormap)
    # Surface relief (grayscale with gamma curve for terrain contrast)
    surface_gray = (np.power(relative_surface, 0.9) * 255.0).astype("uint8")
    surface_gray_rgb = np.stack([surface_gray]*3, axis=-1)

    # Encode images to Base64
    rgb_b64 = numpy_to_base64_data_url(rgb_img, format="JPEG", quality=88)
    depth_b64 = numpy_to_base64_data_url(colorized_depth, format="JPEG", quality=90)
    surface_b64 = numpy_to_base64_data_url(surface_gray_rgb, format="JPEG", quality=88)

    # Stage 5: 3D Terrain Mesh Grid Generation
    mesh_data = generate_terrain_mesh_grid(relative_surface)

    t_end_total = time.perf_counter()
    total_latency_ms = (t_end_total - t_start_total) * 1000.0

    return {
        "status": "success",
        "telemetry": {
            "image_width": orig_w,
            "image_height": orig_h,
            "inference_latency_ms": round(inference_ms, 1),
            "total_latency_ms": round(total_latency_ms, 1),
            "device": DEVICE_INFO["device_name"],
            "model": "Depth Anything V2 Small (ViT-S)",
            "mesh_vertices": mesh_data["vertices_count"],
            "mesh_triangles": mesh_data["triangles_count"],
            "surface_stats": surface_telemetry,
        },
        "images": {
            "original_rgb": rgb_b64,
            "depth_colormap": depth_b64,
            "surface_grayscale": surface_b64,
        },
        "terrain_mesh": mesh_data,
        "scientific_notice": {
            "is_relative": True,
            "unit": "Normalized Relative Elevation [0.0 - 1.0]",
            "message": "Output represents relative surface topography only. Absolute metric elevations (m), georeferencing, and LiDAR/DEM validation are designated for Phase 2."
        }
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "project": "DepthWizard — SIH26175",
        "device": DEVICE_INFO,
        "model": "Depth Anything V2 Small (ViT-S)",
        "pipeline_ready": DepthAnythingV2Model._instance is not None
    }


@app.post("/api/process")
async def process_image(
    file: UploadFile = File(...),
    colormap: str = Form("turbo"),
    fast_mode: bool = Form(False)
):
    try:
        content = await file.read()
        result = run_pipeline(content, file.filename or "uploaded.jpg", colormap=colormap, fast_mode=fast_mode)
        return JSONResponse(content=result)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Inference pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Pipeline error: {str(e)}")


@app.get("/api/demo")
async def run_demo(colormap: str = "turbo"):
    try:
        demo_bytes, filename = get_demo_image_bytes()
        result = run_pipeline(demo_bytes, filename, colormap=colormap, fast_mode=False)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Demo execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Demo error: {str(e)}")


# Serve static built frontend assets if available
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(FRONTEND_DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))

