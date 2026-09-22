"""
DepthWizard - Configuration & Hardware Detection
SIH 2026 Project: SIH26175
"""
import os
import cv2

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Hardware / Device Auto-Detection
def detect_device() -> dict:
    has_cuda = False
    device_name = "CPU (Optimized OpenCV DNN Engine)"
    
    # Check OpenCV CUDA support
    try:
        count = cv2.cuda.getCudaEnabledDeviceCount()
        if count > 0:
            has_cuda = True
            device_name = f"NVIDIA CUDA ({count} device(s) detected)"
    except Exception:
        pass

    return {
        "has_cuda": has_cuda,
        "device_name": device_name,
        "backend": "CUDA" if has_cuda else "CPU"
    }

DEVICE_INFO = detect_device()

# File constraints
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Model configuration
HF_REPO_ID = "onnx-community/depth-anything-v2-small"
MODEL_FILENAME = "onnx/model.onnx"

# Inference resolutions (multiples of 14 for ViT patch alignment)
DEFAULT_INFERENCE_SIZE = (392, 392)
FAST_INFERENCE_SIZE = (266, 266)
HIGH_INFERENCE_SIZE = (518, 518)

# 3D Mesh grid resolution (vertices W x H)
# 128x128 = 16,384 vertices / 32,258 triangles (Ultra smooth 60 FPS in WebGL)
# 192x192 = 36,864 vertices / 73,346 triangles
MESH_GRID_SIZE = 128
