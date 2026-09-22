"""
DepthWizard - Depth Anything V2 Small Inference Engine
Real pretrained model inference via OpenCV DNN and ONNX runtime.
"""
import os
import time
import logging
import cv2
import numpy as np
from huggingface_hub import hf_hub_download
from app.config import (
    HF_REPO_ID,
    MODEL_FILENAME,
    DEVICE_INFO,
    DEFAULT_INFERENCE_SIZE,
    MODELS_DIR
)

logger = logging.getLogger("depthwizard.depth_model")

class DepthAnythingV2Model:
    _instance = None

    def __init__(self):
        self.model_path = None
        self.net = None
        self.device_info = DEVICE_INFO
        self._initialize()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DepthAnythingV2Model()
        return cls._instance

    def _initialize(self):
        logger.info("Initializing Depth Anything V2 Small model...")
        try:
            # Download or load cached official ONNX model
            self.model_path = hf_hub_download(
                repo_id=HF_REPO_ID,
                filename=MODEL_FILENAME,
                local_dir=MODELS_DIR
            )
            logger.info(f"Model checkpoint located at: {self.model_path}")
            
            # Read network via OpenCV DNN
            self.net = cv2.dnn.readNetFromONNX(self.model_path)
            
            # Configure hardware acceleration
            if self.device_info["has_cuda"]:
                logger.info("Enabling NVIDIA CUDA acceleration in OpenCV DNN")
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
            else:
                logger.info("Using optimized CPU backend for inference")
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

            # Warm-up inference
            self._warm_up()
            logger.info("Depth Anything V2 Small loaded and warmed up successfully.")
        except Exception as e:
            logger.error(f"Failed to load Depth Anything V2 model: {e}", exc_info=True)
            raise RuntimeError(f"Depth model initialization failed: {e}")

    def _warm_up(self):
        """Run a lightweight dummy pass to compile and warm up the execution graph."""
        dummy = np.zeros((1, 3, 266, 266), dtype=np.float32)
        self.net.setInput(dummy)
        self.net.forward()

    def predict(self, rgb_image: np.ndarray, inference_size=DEFAULT_INFERENCE_SIZE) -> tuple[np.ndarray, float]:
        """
        Run genuine Depth Anything V2 Small inference on an RGB image.
        
        Args:
            rgb_image: uint8 NumPy array of shape (H, W, 3) in RGB color format.
            inference_size: tuple (target_w, target_h), multiples of 14.
            
        Returns:
            (depth_map, latency_ms):
                depth_map: 2D float32 NumPy array matching original (H, W) dimensions.
                latency_ms: Real inference elapsed time in milliseconds.
        """
        if self.net is None:
            raise RuntimeError("Model network is not initialized.")

        orig_h, orig_w = rgb_image.shape[:2]
        target_w, target_h = inference_size

        # Preprocessing:
        # Resize to network input dimension
        resized = cv2.resize(rgb_image, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
        
        # Normalize: (pixel / 255.0 - mean) / std (ImageNet standards)
        img_float = resized.astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        normalized = (img_float - mean) / std
        
        # Convert HWC to NCHW
        blob = np.transpose(normalized, (2, 0, 1))[np.newaxis, :, :, :].astype(np.float32)
        blob = np.ascontiguousarray(blob)

        # Forward pass with precise timing
        t_start = time.perf_counter()
        self.net.setInput(blob)
        raw_output = self.net.forward()
        t_end = time.perf_counter()
        
        latency_ms = (t_end - t_start) * 1000.0

        # Postprocessing: extract 2D depth map
        depth_raw = np.squeeze(raw_output)
        
        # Resize back to original input image resolution
        depth_full = cv2.resize(depth_raw, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
        
        return depth_full, latency_ms
