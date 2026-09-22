"""
DepthWizard - Image Utilities, Colormapping & Validation
"""
import io
import base64
import cv2
import numpy as np
from PIL import Image
from app.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES

def validate_and_load_image(file_bytes: bytes, filename: str) -> np.ndarray:
    """
    Validate uploaded image file bytes and decode into an RGB NumPy array.
    
    Raises:
        ValueError if format is invalid, corrupted, or dimensions are improper.
    """
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size ({len(file_bytes) / (1024*1024):.1f} MB) exceeds maximum allowed limit of 25 MB.")

    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP.")

    try:
        # Load with PIL to verify integrity
        pil_img = Image.open(io.BytesIO(file_bytes))
        pil_img.verify()
        
        # Re-open after verify() closes it
        pil_img = Image.open(io.BytesIO(file_bytes))
        
        # Convert to RGB (handles RGBA, Palette, Grayscale)
        rgb_img = pil_img.convert("RGB")
        img_np = np.array(rgb_img)
    except Exception as e:
        raise ValueError(f"Corrupted or invalid image file: {str(e)}")

    h, w = img_np.shape[:2]
    if h < 32 or w < 32:
        raise ValueError(f"Image dimensions ({w}x{h}) are too small. Minimum required: 32x32 pixels.")
    if h > 8192 or w > 8192:
        raise ValueError(f"Image dimensions ({w}x{h}) exceed maximum allowed dimension of 8192 pixels.")

    return img_np


def colorize_depth_map(relative_surface: np.ndarray, colormap: str = "turbo") -> np.ndarray:
    """
    Colorize normalized relative surface [0.0 - 1.0] using scientific colormaps.
    Returns RGB uint8 NumPy array of shape (H, W, 3).
    """
    # Scale to 0-255 uint8
    depth_uint8 = (relative_surface * 255.0).astype(np.uint8)

    cmap_code = cv2.COLORMAP_TURBO
    if colormap.lower() == "inferno":
        cmap_code = cv2.COLORMAP_INFERNO
    elif colormap.lower() == "viridis":
        cmap_code = cv2.COLORMAP_VIRIDIS
    elif colormap.lower() == "magma":
        cmap_code = cv2.COLORMAP_MAGMA

    # OpenCV colormap produces BGR
    bgr_colored = cv2.applyColorMap(depth_uint8, cmap_code)
    # Convert to RGB
    rgb_colored = cv2.cvtColor(bgr_colored, cv2.COLOR_BGR2RGB)
    return rgb_colored


def numpy_to_base64_data_url(img_rgb: np.ndarray, format: str = "JPEG", quality: int = 90) -> str:
    """Convert an RGB NumPy image array to a base64 data URL string."""
    pil_img = Image.fromarray(img_rgb)
    buffered = io.BytesIO()
    pil_img.save(buffered, format=format, quality=quality)
    encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
    mime = "image/jpeg" if format.upper() == "JPEG" else "image/png"
    return f"data:{mime};base64,{encoded}"
