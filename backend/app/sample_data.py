"""
DepthWizard - Sample Aerial Remote-Sensing Generator & Loader
Provides an instant 'Try Demo' aerial imagery experience.
"""
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw
from app.config import SAMPLES_DIR

SAMPLE_FILE_PATH = os.path.join(SAMPLES_DIR, "sample_aerial.jpg")

def generate_realistic_aerial_sample() -> str:
    """
    Synthesizes a realistic high-resolution remote-sensing aerial scene
    featuring terrain relief: rolling hills, agricultural plots, a meandering river,
    urban building structures, and road networks.
    """
    if os.path.exists(SAMPLE_FILE_PATH):
        return SAMPLE_FILE_PATH

    width, height = 512, 512
    # Base terrain (soft earth / pasture green)
    base = np.zeros((height, width, 3), dtype=np.uint8)
    base[:] = (68, 110, 52)  # Natural vegetation green

    # Add Gaussian terrain noise for natural texture
    noise = np.random.normal(0, 12, (height, width, 3)).astype(np.int16)
    base = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # 1. Rolling Hill / Elevated Ridge (Top-Right to Center)
    for y in range(height):
        for x in range(width):
            dist_to_ridge = np.hypot(x - 380, y - 120)
            if dist_to_ridge < 160:
                elevation_factor = (1.0 - (dist_to_ridge / 160.0)) ** 1.5
                # Hill shading & rocky vegetation tint
                rock_color = np.array([115, 125, 90], dtype=np.float32)
                base[y, x] = (base[y, x] * (1 - elevation_factor * 0.7) + rock_color * (elevation_factor * 0.7)).astype(np.uint8)

    # 2. Meandering River Channel (Diagonal bottom-left to mid-right)
    pil_img = Image.fromarray(base)
    draw = ImageDraw.Draw(pil_img)
    river_points = [
        (-20, 360), (80, 340), (160, 370), (250, 330), (340, 350), (430, 320), (540, 340)
    ]
    draw.line(river_points, fill=(40, 75, 115), width=22)
    # River banks
    draw.line(river_points, fill=(55, 95, 135), width=16)

    # 3. Agricultural Field Parcels (Geometric agricultural patchwork)
    fields = [
        # (x1, y1, x2, y2, color)
        (30, 40, 140, 130, (180, 160, 110)),   # Harvested wheat
        (150, 30, 260, 120, (50, 95, 45)),     # Dark crop
        (40, 145, 130, 240, (135, 155, 75)),   # Young pasture
        (140, 135, 250, 250, (150, 120, 80)),  # Tilled soil
        (20, 255, 150, 320, (120, 145, 60)),   # Vineyard / orchard
    ]
    for x1, y1, x2, y2, col in fields:
        draw.rectangle([x1, y1, x2, y2], fill=col, outline=(35, 55, 30), width=2)
        # Texture lines in fields (furrows)
        for fx in range(x1 + 6, x2, 8):
            draw.line([(fx, y1 + 2), (fx, y2 - 2)], fill=(int(col[0]*0.88), int(col[1]*0.88), int(col[2]*0.88)), width=1)

    # 4. Urban Settlement / Building Footprints (Bottom-Right quadrant)
    # Road network
    roads = [
        [(270, 360), (270, 520)],
        [(400, 340), (400, 520)],
        [(250, 420), (520, 420)],
        [(250, 470), (520, 470)],
    ]
    for r in roads:
        draw.line(r, fill=(75, 78, 82), width=7)
        draw.line(r, fill=(120, 124, 128), width=5)

    # Buildings (elevated structural footprints with cast shadow)
    buildings = [
        (290, 380, 335, 410, (190, 85, 65)),    # Terracotta roof
        (350, 380, 390, 410, (210, 205, 195)),  # Concrete flat roof
        (420, 375, 480, 405, (160, 175, 190)),  # Industrial metal roof
        (290, 435, 340, 460, (200, 95, 70)),    # Residential cluster
        (360, 435, 390, 460, (220, 215, 200)),
        (420, 435, 470, 460, (185, 80, 60)),
        (300, 485, 350, 510, (170, 180, 195)),
        (370, 485, 440, 510, (205, 100, 75)),
    ]
    for bx1, by1, bx2, by2, roof_col in buildings:
        # Cast shadow on ground
        draw.rectangle([bx1 + 3, by1 + 3, bx2 + 3, by2 + 3], fill=(25, 30, 25))
        # Building roof
        draw.rectangle([bx1, by1, bx2, by2], fill=roof_col, outline=(40, 40, 40), width=1)

    # Save to disk
    pil_img.save(SAMPLE_FILE_PATH, format="JPEG", quality=95)
    return SAMPLE_FILE_PATH

def get_demo_image_bytes() -> tuple[bytes, str]:
    """Returns sample image raw bytes and filename."""
    path = generate_realistic_aerial_sample()
    with open(path, "rb") as f:
        data = f.read()
    return data, "sample_aerial.jpg"
