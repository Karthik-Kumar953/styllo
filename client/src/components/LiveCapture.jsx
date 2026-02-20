import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, X, Aperture, SwitchCamera, AlertCircle, Loader2, RotateCcw, Check } from "lucide-react";
import { detectFaceLive, loadModels } from "../engine/faceDetection";

export default function LiveCapture({ onCapture, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [modelsReady, setModelsReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // Recapture preview state
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);

  // Load face-api.js models
  useEffect(() => {
    loadModels()
      .then(() => setModelsReady(true))
      .catch(() => setError("Failed to load AI models. Please refresh."));
  }, []);

  // Start camera
  useEffect(() => {
    if (capturedPreview) return; // Don't start camera when in preview mode

    let cancelled = false;

    async function startCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (err) {
        if (!cancelled) {
          if (err.name === "NotAllowedError") {
            setError("Camera access denied. Please allow camera access in your browser settings.");
          } else {
            setError("Could not access camera. Please check your device.");
          }
        }
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [facingMode, capturedPreview]);

  // Live face detection loop
  useEffect(() => {
    if (!cameraReady || !modelsReady || capturedPreview) return;

    let running = true;

    async function detectLoop() {
      if (!running || !videoRef.current) return;

      try {
        const result = await detectFaceLive(videoRef.current);
        if (!running) return;
        setFaceDetected(!!result);

        if (overlayRef.current && videoRef.current) {
          const overlay = overlayRef.current;
          const video = videoRef.current;
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
          const ctx = overlay.getContext("2d");
          ctx.clearRect(0, 0, overlay.width, overlay.height);

          if (result) {
            const { box, landmarks } = result;
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
            const jaw = landmarks.getJawOutline();
            [...jaw.slice(1, 6), ...jaw.slice(10, 15)].forEach((p) => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }
      } catch { /* ignore */ }

      if (running) {
        animFrameRef.current = requestAnimationFrame(() => setTimeout(detectLoop, 120));
      }
    }

    detectLoop();
    return () => { running = false; };
  }, [cameraReady, modelsReady, capturedPreview]);

  // Capture photo → show preview
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !faceDetected) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "live-capture.jpg", { type: "image/jpeg" });
        const preview = canvas.toDataURL("image/jpeg", 0.9);

        // Stop camera
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        setCapturedFile(file);
        setCapturedPreview(preview);
        setCameraReady(false);
      }
      setCapturing(false);
    }, "image/jpeg", 0.9);
  }, [faceDetected]);

  // Retake — clear preview, restart camera
  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
    setFaceDetected(false);
  };

  // Confirm — proceed to next step
  const handleConfirm = () => {
    if (capturedFile && capturedPreview) {
      onCapture(capturedFile, capturedPreview);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    setCameraReady(false);
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
  };

  // Error state
  if (error) {
    return (
      <div className="w-full flex flex-col items-center gap-5 pt-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-red-300 text-sm max-w-xs">{error}</p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full glass text-zinc-300 text-sm hover:bg-white/[0.04] transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  // ── Capture Preview Mode ──
  if (capturedPreview) {
    return (
      <div className="w-full flex flex-col items-center gap-4 pt-4">
        <div className="w-full text-center mb-2">
          <h2 className="text-2xl font-display font-bold text-white mb-1">
            Looking <span className="gradient-text">Good!</span>
          </h2>
          <p className="text-zinc-400 text-sm">Happy with this photo?</p>
        </div>

        <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden glass">
          <img
            src={capturedPreview}
            alt="Captured photo"
            className="w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />

          {/* Overlay badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Photo Captured
            </div>
          </div>
        </div>

        {/* Retake / Continue */}
        <div className="flex gap-3 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRetake}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl glass hover:bg-white/[0.04] text-zinc-300 font-medium text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retake
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/20"
          >
            <Check className="w-4 h-4" /> Continue
          </motion.button>
        </div>

        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-1">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    );
  }

  // ── Live Camera Mode ──
  return (
    <div className="w-full flex flex-col items-center gap-4 pt-4">
      <div className="w-full text-center mb-2">
        <h2 className="text-2xl font-display font-bold text-white mb-1">
          Live <span className="gradient-text">Capture</span>
        </h2>
        <p className="text-zinc-400 text-sm">Position your face in the frame</p>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden glass">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline muted
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!modelsReady && (
          <div className="absolute inset-0 bg-surface-950/80 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <p className="text-zinc-400 text-sm">Loading AI models...</p>
          </div>
        )}

        {modelsReady && !cameraReady && (
          <div className="absolute inset-0 bg-surface-950/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        )}

        {cameraReady && modelsReady && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md ${
              faceDetected
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              <span className={`w-2 h-2 rounded-full ${faceDetected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              {faceDetected ? "Face Detected" : "No Face Detected"}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full max-w-md">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-12 h-12 rounded-full glass flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: faceDetected ? 1.05 : 1 }}
          whileTap={{ scale: faceDetected ? 0.92 : 1 }}
          onClick={handleCapture}
          disabled={!faceDetected || capturing}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            faceDetected && !capturing
              ? "bg-gradient-to-r from-primary-600 to-rose-500 text-white shadow-lg shadow-primary-500/20"
              : "bg-surface-700 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {capturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Aperture className="w-5 h-5" />}
          {capturing ? "Capturing..." : "Capture Photo"}
        </motion.button>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={toggleCamera}
          className="w-12 h-12 rounded-full glass flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <SwitchCamera className="w-5 h-5" />
        </motion.button>
      </div>

      <p className="text-zinc-600 text-xs text-center">
        Tip: Good lighting and a clear view of your face gives the best results
      </p>
    </div>
  );
}
