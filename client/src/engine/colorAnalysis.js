// ── RGB → LAB Color Space Conversion ──

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToXyz(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return {
    x: lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
    y: lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750,
    z: lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041,
  };
}

function xyzToLab(x, y, z) {
  const xn = 0.95047, yn = 1.0, zn = 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function rgbToLab(r, g, b) {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

// ── Skin Pixel Extraction ──

/**
 * Extract skin pixels using face-api.js 68-point landmarks.
 * Samples from cheek regions (left + right) for maximum accuracy.
 */
export function extractSkinPixelsFromLandmarks(canvas, landmarks) {
  const ctx = canvas.getContext("2d");
  const pixels = [];
  const RADIUS = Math.max(8, Math.round(canvas.width * 0.02)); // Adaptive sample radius

  const sampleRegions = [
    ...landmarks.leftCheek,
    ...landmarks.rightCheek,
    ...landmarks.nose,
  ];

  for (const point of sampleRegions) {
    const cx = Math.round(point.x);
    const cy = Math.round(point.y);

    // Sample a small square around each landmark point
    const x0 = Math.max(0, cx - RADIUS);
    const y0 = Math.max(0, cy - RADIUS);
    const w = Math.min(RADIUS * 2, canvas.width - x0);
    const h = Math.min(RADIUS * 2, canvas.height - y0);

    if (w <= 0 || h <= 0) continue;

    const imageData = ctx.getImageData(x0, y0, w, h);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;

      // Filter extreme highlights, shadows, and non-skin colors
      if (brightness > 30 && brightness < 230) {
        pixels.push([r, g, b]);
      }
    }
  }

  return { pixels };
}

/**
 * Fallback: Extract skin pixels using bounding box (when landmarks unavailable).
 */
export function extractSkinPixels(canvas, faceBbox) {
  const ctx = canvas.getContext("2d");

  const skinRegion = {
    x: Math.max(0, Math.round(faceBbox.x)),
    y: Math.max(0, Math.round(faceBbox.y + faceBbox.height * 0.3)),
    width: Math.round(faceBbox.width),
    height: Math.round(faceBbox.height * 0.45),
  };

  skinRegion.width = Math.min(skinRegion.width, canvas.width - skinRegion.x);
  skinRegion.height = Math.min(skinRegion.height, canvas.height - skinRegion.y);

  if (skinRegion.width <= 0 || skinRegion.height <= 0) return { pixels: [], skinRegion };

  const imageData = ctx.getImageData(
    skinRegion.x, skinRegion.y, skinRegion.width, skinRegion.height
  );

  const pixels = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness > 30 && brightness < 230) {
      pixels.push([r, g, b]);
    }
  }

  return { pixels, skinRegion };
}

// ── K-Means Clustering ──

function euclideanDist(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

export function kMeans(pixels, k = 3, maxIter = 20) {
  if (pixels.length < k) return pixels.map((p) => ({ centroid: p, pixels: [p] }));

  const indices = new Set();
  while (indices.size < k) indices.add(Math.floor(Math.random() * pixels.length));
  let centroids = [...indices].map((i) => [...pixels[i]]);
  let assignments = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity, minIdx = 0;
      for (let j = 0; j < k; j++) {
        const d = euclideanDist(pixels[i], centroids[j]);
        if (d < minDist) { minDist = d; minIdx = j; }
      }
      if (assignments[i] !== minIdx) { assignments[i] = minIdx; changed = true; }
    }

    if (!changed) break;

    for (let j = 0; j < k; j++) {
      const cluster = pixels.filter((_, i) => assignments[i] === j);
      if (cluster.length > 0) {
        centroids[j] = [0, 1, 2].map(
          (ch) => cluster.reduce((s, p) => s + p[ch], 0) / cluster.length
        );
      }
    }
  }

  return centroids.map((c, j) => ({
    centroid: c,
    pixels: pixels.filter((_, i) => assignments[i] === j),
  }));
}

// ── Dominant Skin Color ──

export function findDominantSkinColor(pixels) {
  if (pixels.length === 0) return null;

  const clusters = kMeans(pixels, 3);

  const labClusters = clusters
    .filter((c) => c.pixels.length > 0)
    .map((c) => ({
      ...c,
      lab: rgbToLab(c.centroid[0], c.centroid[1], c.centroid[2]),
      rgb: c.centroid,
    }))
    .sort((a, b) => a.lab.L - b.lab.L);

  const midIndex = Math.floor(labClusters.length / 2);
  return labClusters[midIndex] || labClusters[0];
}
