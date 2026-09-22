# DepthWizard — SIH26175
### Single-View Height Estimation and 3D Flythrough
**Smart India Hackathon (SIH 2026) Prototype**

DepthWizard is a real, working geospatial AI prototype that converts a single optical remote-sensing RGB image (satellite or aerial) into a **relative depth map**, **normalized relative surface elevation model**, and an **interactive 3D terrain mesh** with satellite texture mapping.

---

## 🚀 Key Features

1. **Remote-Sensing Image Upload & Validation**
   - Supports JPG, JPEG, PNG, and WEBP formats with 25MB file integrity verification.
   - Real-time client preview with dimensions and file size.
   - Instant **"Try Demo"** button with a bundled multi-feature satellite aerial scene (agricultural plots, river valley, hills, and urban settlements).

2. **Genuine Deep Learning Depth Estimation**
   - Powered by pretrained **Depth Anything V2 Small** (`onnx-community/depth-anything-v2-small` / ViT-S).
   - Executes real forward-pass tensor inference (zero hardcoded / fake outputs).
   - Auto-detects and leverages **NVIDIA CUDA** or high-performance **CPU inference engines**.
   - Supports standard (392px) and fast (266px) adaptive inference modes.

3. **Scientific Relative Surface Reconstruction**
   - Normalizes monocular inverse-depth cues into a strict **relative elevation matrix `[0.0, 1.0]`**.
   - **Strict Scientific Rule Compliance**: JPG/PNG outputs are explicitly treated as relative relief models. No fabricated metric heights (meters), GPS coordinates, or uncalibrated DEM accuracy numbers are simulated.
   - Generates perceptual colorized depth maps (Turbo, Inferno, Viridis, Magma) with scale legends, and grayscale terrain relief models.

4. **Interactive 3D Terrain Flythrough (WebGL / Three.js)**
   - Built with **Three.js** and **React Three Fiber (R3F)**.
   - **Texture Mapping**: Dynamically wraps the original satellite RGB image directly onto the 3D surface mesh.
   - Full 6-DOF camera controls via `OrbitControls`:
     - **Rotate**: Left Click + Drag
     - **Zoom**: Scroll Wheel
     - **Pan**: Right Click + Drag
     - **Reset Camera**: One-click restore to nominal aerial vantage
   - **Visual Height Exaggeration Slider**: Range `0.1×` to `3.5×`, prominently designated as a visual enhancement tool.
   - **Wireframe Mode**: Inspect underlying triangulated mesh topology.
   - **Auto-Rotate**: Continuous cinematic flythrough preview.
   - **Shading Modes**: Switch between Satellite RGB, Depth Colormap, or Shaded Relief with directional sunlight and cast shadows.

5. **Geospatial Telemetry HUD**
   - Real-time telemetry cards reporting:
     - Input Resolution ($W \times H$)
     - Inference Latency (ms)
     - Total Pipeline Execution Latency (s)
     - Mesh Complexity: Vertices ($16,384$) and Triangles ($32,258$)
     - Relative Elevation Distribution: Min ($0.000$), Max ($1.000$), Mean, Std Dev
     - Compute Device Indicator (CUDA GPU vs CPU Mode)

6. **Clear Pipeline Stage Tracker**
   - Animated visual execution stepper:  
     `Uploading` ➔ `Depth Estimation` ➔ `Surface Generation` ➔ `3D Generation` ➔ `Complete`.

7. **Phase 2 Roadmap Panel**
   - Highlights planned integration of Ground Control Points (GCPs), SRTM DEM ground-truth calibration, and LiDAR point cloud alignment for absolute metric measurements.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite UI                   │
│   (Three.js / React Three Fiber / Tailwind CSS / Lucide)│
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/process (or GET /api/demo)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI Backend Server                 │
│  ├── 1. Image Validator (Format, size, decode check)   │
│  ├── 2. Depth Anything V2 Small (OpenCV DNN / CUDA)    │
│  ├── 3. Relative Surface Normalizer [0.0 - 1.0]        │
│  ├── 4. Colorizer (Turbo / Inferno colormaps)          │
│  └── 5. 3D Terrain Grid Generator (128x128 vertices)   │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, `@react-three/fiber`, `@react-three/drei`, `lucide-react`.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, OpenCV (`cv2.dnn`), NumPy, Pillow, Hugging Face Hub.

---

## ⚡ Quick Start & Run Commands

### 1. Backend Server Setup & Start

Open a terminal in the project root:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server will start at `http://127.0.0.1:8000`.  
- Interactive API Documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Frontend Development Server

Open a second terminal:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend will start at `http://localhost:5173`.  
Open `http://localhost:5173` in your web browser.

> **Production / Standalone Single-Port Mode**:  
> The frontend is pre-built into `frontend/dist`. You can simply run `python -m uvicorn app.main:app --port 8000` and visit `http://127.0.0.1:8000` directly to use the full application from a single port!

---

## 🧪 Automated Verification & Testing

To run the automated end-to-end backend test suite:

```bash
python backend/test_backend.py
```

This verifies:
1. Hardware auto-detection (CPU/CUDA)
2. Synthetic remote-sensing aerial imagery generation
3. Format validation and corrupted file rejection
4. Genuine Depth Anything V2 Small inference and latency timing
5. Strict relative surface normalization ($[0.0, 1.0]$)
6. 3D terrain grid synthesis ($16,384$ vertices, $32,258$ triangles)
7. Colorization and Base64 stream encoding
8. FastAPI `/api/health`, `/api/demo`, and `/api/process` endpoints

To verify the frontend TypeScript and production bundle:

```bash
cd frontend
npm run build
```

---

## 📜 Scientific Methodology & Disclaimers

- **Relative Elevation Only**: Monocular depth estimation maps optical intensity, perspective, and shadow cues to relative disparity. In single-view remote sensing, these cues produce a faithful relative elevation topology, but lack metric scale without sensor ephemeris or ground-truth calibration.
- **Metric Scale Notice**: True metric elevation (elevation in meters above sea level) requires stereo photogrammetry, LiDAR, or calibrated Digital Elevation Models (DEMs). These features are slated for DepthWizard Phase 2.
