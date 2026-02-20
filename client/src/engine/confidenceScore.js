/**
 * Confidence score (0–1) derived from:
 *  1. Cluster tightness — low pixel variance = high confidence
 *  2. Face coverage — larger face region = more reliable
 *  3. Sample size — more valid skin pixels = more reliable
 */

export function calculateConfidence(cluster, faceCoverage, totalPixels) {
  const variance = clusterVariance(cluster.pixels, cluster.centroid);
  const varianceScore = Math.max(0, 1 - variance / 5000);

  const coverageScore = Math.min(1, faceCoverage * 5); // expect ~20%
  const sampleScore = Math.min(1, totalPixels / 500);  // expect 500+

  const confidence =
    varianceScore * 0.5 + coverageScore * 0.3 + sampleScore * 0.2;

  return Math.round(confidence * 100) / 100;
}

function clusterVariance(pixels, centroid) {
  if (pixels.length === 0) return Infinity;
  const total = pixels.reduce((sum, px) => {
    return sum + px.reduce((d, v, i) => d + (v - centroid[i]) ** 2, 0);
  }, 0);
  return total / pixels.length;
}
