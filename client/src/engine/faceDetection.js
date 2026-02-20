import * as faceapi from "face-api.js";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model/";

let modelsLoaded = false;
let loadPromise = null;

/**
 * Load face-api.js models (TinyFaceDetector + 68pt landmarks + age/gender).
 * Uses CDN-hosted weights — no local model files needed.
 */
export async function loadModels() {
  if (modelsLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log("✅ face-api.js models loaded");
  })();

  return loadPromise;
}

/**
 * Detect face in an image or video element.
 * Returns bounding box, 68 landmarks, age, and gender.
 */
export async function detectFace(input) {
  await loadModels();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.5,
  });

  const result = await faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks()
    .withAgeAndGender();

  if (!result) return null;

  const box = result.detection.box;
  const landmarks = result.landmarks;

  // Extract key landmark regions for precise skin sampling
  const jaw = landmarks.getJawOutline();
  const nose = landmarks.getNose();
  const leftCheek = jaw.slice(1, 6);   // Left jawline → cheek area
  const rightCheek = jaw.slice(10, 15); // Right jawline → cheek area

  return {
    // Bounding box
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    confidence: result.detection.score,
    // Metadata
    age: Math.round(result.age),
    gender: result.gender,
    genderProbability: result.genderProbability,
    // Landmarks for skin sampling
    landmarks: {
      leftCheek,
      rightCheek,
      nose: nose.slice(3), // Nose bridge midpoints
      jawline: jaw,
      all: landmarks.positions,
    },
  };
}

/**
 * Detect face in video element for live preview (lightweight — detection only).
 */
export async function detectFaceLive(videoEl) {
  await loadModels();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224, // Smaller for real-time performance
    scoreThreshold: 0.45,
  });

  const result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks();

  if (!result) return null;

  return {
    box: result.detection.box,
    landmarks: result.landmarks,
    score: result.detection.score,
  };
}

export { faceapi };
