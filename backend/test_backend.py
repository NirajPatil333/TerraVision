"""
DepthWizard - Backend Automated Verification Test Suite
Tests pipeline components, model inference, surface normalization, and API routes.
"""
import sys
import os
import io
import time
import numpy as np

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import DEVICE_INFO, MESH_GRID_SIZE
from app.sample_data import get_demo_image_bytes, generate_realistic_aerial_sample
from app.utils import validate_and_load_image, colorize_depth_map, numpy_to_base64_data_url
from app.depth_model import DepthAnythingV2Model
from app.surface import normalize_relative_surface, generate_terrain_mesh_grid
from fastapi.testclient import TestClient
from app.main import app

def run_all_tests():
    print("==================================================")
    print("  DepthWizard (SIH26175) — Backend Test Suite     ")
    print("==================================================")

    # 1. Device and Hardware Detection
    print("\n[TEST 1] Hardware Detection:")
    print(f"  Device Name: {DEVICE_INFO['device_name']}")
    print(f"  CUDA Available: {DEVICE_INFO['has_cuda']}")
    print(f"  Backend: {DEVICE_INFO['backend']}")
    assert "device_name" in DEVICE_INFO, "Device info missing device_name"
    print("  --> PASS: Hardware detection verified.")

    # 2. Sample Aerial Generation
    print("\n[TEST 2] Sample Aerial Remote-Sensing Generator:")
    demo_bytes, filename = get_demo_image_bytes()
    print(f"  Generated sample file: {filename}, size: {len(demo_bytes)} bytes")
    assert len(demo_bytes) > 1000, "Sample aerial image generation failed"
    print("  --> PASS: Sample image generated.")

    # 3. Image Validation & Error Handling
    print("\n[TEST 3] Image Validation & Corrupted File Rejection:")
    # Valid file
    rgb = validate_and_load_image(demo_bytes, filename)
    print(f"  Valid sample decoded: shape={rgb.shape}, dtype={rgb.dtype}")
    assert rgb.shape == (512, 512, 3), "Sample image shape mismatch"
    
    # Invalid extension
    try:
        validate_and_load_image(b"fake data", "test.pdf")
        assert False, "Failed to reject invalid extension"
    except ValueError as e:
        print(f"  Successfully rejected invalid extension: {e}")

    # Corrupted image
    try:
        validate_and_load_image(b"\x00\x01\x02\x03\x04corrupted", "corrupted.jpg")
        assert False, "Failed to reject corrupted image"
    except ValueError as e:
        print(f"  Successfully rejected corrupted bytes: {e}")
    print("  --> PASS: Validation and error handling verified.")

    # 4. Model Loading & Real Inference
    print("\n[TEST 4] Pretrained Depth Anything V2 Small Inference:")
    model = DepthAnythingV2Model.get_instance()
    t0 = time.time()
    raw_depth, latency_ms = model.predict(rgb, inference_size=(266, 266))
    t1 = time.time()
    print(f"  Inference executed in {latency_ms:.1f} ms (Total wall clock: {(t1-t0)*1000:.1f} ms)")
    print(f"  Raw depth map shape: {raw_depth.shape}, min: {raw_depth.min():.4f}, max: {raw_depth.max():.4f}")
    assert raw_depth.shape == (512, 512), "Raw depth output shape mismatch"
    assert raw_depth.min() != raw_depth.max(), "Model returned flat uniform output"
    print("  --> PASS: Real model inference verified.")

    # 5. Relative Surface Normalization [0.0 - 1.0]
    print("\n[TEST 5] Surface Normalization & Scientific Telemetry:")
    relative_surface, telemetry = normalize_relative_surface(raw_depth)
    print(f"  Relative elevation min: {relative_surface.min():.4f}, max: {relative_surface.max():.4f}")
    print(f"  Mean relative elevation: {telemetry['mean_relative_elevation']}")
    print(f"  Is metric flag: {telemetry['is_metric']} (Strict relative rule verified)")
    assert 0.0 <= relative_surface.min() <= 0.001, "Relative elevation min must be ~0.0"
    assert 0.999 <= relative_surface.max() <= 1.0, "Relative elevation max must be ~1.0"
    assert telemetry["is_metric"] is False, "Violation: output claimed metric elevation"
    print("  --> PASS: Surface normalization verified.")

    # 6. 3D Terrain Mesh Grid Generation
    print("\n[TEST 6] 3D Terrain Mesh Grid Generation:")
    mesh = generate_terrain_mesh_grid(relative_surface, grid_size=MESH_GRID_SIZE)
    print(f"  Grid size: {mesh['grid_width']}x{mesh['grid_height']}")
    print(f"  Vertices count: {mesh['vertices_count']}")
    print(f"  Triangles count: {mesh['triangles_count']}")
    print(f"  Height map points: {len(mesh['height_map'])}")
    assert mesh["vertices_count"] == MESH_GRID_SIZE * MESH_GRID_SIZE
    assert len(mesh["height_map"]) == MESH_GRID_SIZE * MESH_GRID_SIZE
    print("  --> PASS: 3D Terrain mesh grid verified.")

    # 7. Colorization and Base64 Encoding
    print("\n[TEST 7] Colorization & Base64:")
    colorized = colorize_depth_map(relative_surface, "turbo")
    assert colorized.shape == (512, 512, 3)
    b64_url = numpy_to_base64_data_url(colorized)
    assert b64_url.startswith("data:image/jpeg;base64,")
    print(f"  Base64 data URL generated (prefix: {b64_url[:35]}...)")
    print("  --> PASS: Colorization and encoding verified.")

    # 8. FastAPI API Route Verification
    print("\n[TEST 8] FastAPI Client Integration Test:")
    client = TestClient(app)
    
    # Health endpoint
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    print(f"  /api/health response: {res_health.json()['status']}")

    # Demo endpoint
    res_demo = client.get("/api/demo")
    assert res_demo.status_code == 200
    demo_json = res_demo.json()
    assert demo_json["status"] == "success"
    assert "images" in demo_json
    assert "original_rgb" in demo_json["images"]
    assert "depth_colormap" in demo_json["images"]
    assert "terrain_mesh" in demo_json
    print(f"  /api/demo response: success, latency={demo_json['telemetry']['total_latency_ms']} ms")

    # Upload endpoint with demo image
    res_upload = client.post(
        "/api/process",
        files={"file": ("test_aerial.jpg", io.BytesIO(demo_bytes), "image/jpeg")},
        data={"colormap": "turbo", "fast_mode": "true"}
    )
    assert res_upload.status_code == 200
    upload_json = res_upload.json()
    assert upload_json["status"] == "success"
    print(f"  /api/process response: success, vertices={upload_json['terrain_mesh']['vertices_count']}")
    print("  --> PASS: FastAPI endpoints verified.")

    print("\n==================================================")
    print("  ALL BACKEND TESTS PASSED SUCCESSFULLY!          ")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
