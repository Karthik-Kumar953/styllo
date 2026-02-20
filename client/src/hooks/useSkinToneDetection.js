import { useState, useCallback } from "react";
import { detectFace, loadModels } from "../engine/faceDetection";
import { extractSkinPixelsFromLandmarks, extractSkinPixels, findDominantSkinColor } from "../engine/colorAnalysis";
import { classifySkinTone } from "../engine/skinClassifier";
import { calculateConfidence } from "../engine/confidenceScore";

const ERROR_MESSAGES = {
  NO_FACE_DETECTED: "No face detected. Please use a clear, well-lit photo of your face.",
  INSUFFICIENT_PIXELS: "Could not analyze enough skin area. Try a closer photo with better lighting.",
  COLOR_ANALYSIS_FAILED: "Color analysis failed. Please try a well-lit photo.",
  IMAGE_LOAD_FAILED: "Failed to load the image. Please try a different file.",
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = URL.createObjectURL(file);
  });
}

export function useSkinToneDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("");

  /**
   * Analyze from a File (uploaded photo or captured snapshot).
   */
  const analyze = useCallback(async (imageFile) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // 1 — Load image
      setStage("Loading image...");
      const img = await loadImage(imageFile);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);

      // 2 — Load models + detect face with landmarks
      setStage("Loading AI models...");
      await loadModels();

      setStage("Detecting face...");
      const face = await detectFace(img);
      if (!face) throw new Error("NO_FACE_DETECTED");

      // 3 — Sample skin pixels using landmarks (precise) or bbox (fallback)
      setStage("Analyzing skin tone...");
      let pixels;
      if (face.landmarks) {
        const result = extractSkinPixelsFromLandmarks(canvas, face.landmarks);
        pixels = result.pixels;
      } else {
        const result = extractSkinPixels(canvas, face);
        pixels = result.pixels;
      }
      if (pixels.length < 50) throw new Error("INSUFFICIENT_PIXELS");

      // 4 — K-Means clustering → dominant skin color
      const dominant = findDominantSkinColor(pixels);
      if (!dominant) throw new Error("COLOR_ANALYSIS_FAILED");

      // 5 — Classify skin tone
      setStage("Classifying...");
      const skinTone = classifySkinTone(dominant.lab);

      // 6 — Confidence score
      const faceCoverage = (face.width * face.height) / (canvas.width * canvas.height);
      const confidence = calculateConfidence(dominant, faceCoverage, pixels.length);

      const analysisResult = {
        skinTone,
        confidence,
        lab: dominant.lab,
        rgb: dominant.rgb,
        faceDetected: true,
        pixelCount: pixels.length,
        // face-api.js extras
        age: face.age || null,
        detectedGender: face.gender || null,
        genderProbability: face.genderProbability || null,
      };

      setResult(analysisResult);
      URL.revokeObjectURL(img.src);
      return analysisResult;
    } catch (err) {
      const msg = ERROR_MESSAGES[err.message] || ERROR_MESSAGES.COLOR_ANALYSIS_FAILED;
      setError(msg);
      throw err;
    } finally {
      setIsAnalyzing(false);
      setStage("");
    }
  }, []);

  /**
   * Analyze directly from a canvas (for live capture — no file needed).
   */
  const analyzeFromCanvas = useCallback(async (canvas) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      setStage("Loading AI models...");
      await loadModels();

      setStage("Detecting face...");
      const face = await detectFace(canvas);
      if (!face) throw new Error("NO_FACE_DETECTED");

      setStage("Analyzing skin tone...");
      let pixels;
      if (face.landmarks) {
        pixels = extractSkinPixelsFromLandmarks(canvas, face.landmarks).pixels;
      } else {
        pixels = extractSkinPixels(canvas, face).pixels;
      }
      if (pixels.length < 50) throw new Error("INSUFFICIENT_PIXELS");

      const dominant = findDominantSkinColor(pixels);
      if (!dominant) throw new Error("COLOR_ANALYSIS_FAILED");

      setStage("Classifying...");
      const skinTone = classifySkinTone(dominant.lab);

      const faceCoverage = (face.width * face.height) / (canvas.width * canvas.height);
      const confidence = calculateConfidence(dominant, faceCoverage, pixels.length);

      const analysisResult = {
        skinTone,
        confidence,
        lab: dominant.lab,
        rgb: dominant.rgb,
        faceDetected: true,
        pixelCount: pixels.length,
        age: face.age || null,
        detectedGender: face.gender || null,
        genderProbability: face.genderProbability || null,
      };

      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const msg = ERROR_MESSAGES[err.message] || ERROR_MESSAGES.COLOR_ANALYSIS_FAILED;
      setError(msg);
      throw err;
    } finally {
      setIsAnalyzing(false);
      setStage("");
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setStage("");
    setIsAnalyzing(false);
  }, []);

  return { analyze, analyzeFromCanvas, isAnalyzing, result, error, stage, reset };
}
