const API_BASE = import.meta.env.VITE_API_URL || "";

/** Photo-based analysis */
export async function getRecommendations(skinTone, confidence, gender) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skinTone, confidence, gender }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error (${res.status})`);
  }

  return res.json();
}

/** Text prompt analysis (no photo) */
export async function getRecommendationsFromText(prompt) {
  const res = await fetch(`${API_BASE}/api/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error (${res.status})`);
  }

  return res.json();
}

/** Form-based analysis (no photo) */
export async function getRecommendationsFromForm(formData) {
  const res = await fetch(`${API_BASE}/api/analyze-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error (${res.status})`);
  }

  return res.json();
}

/** Decode any outfit — text description */
export async function decodeOutfit(description, profile = null) {
  const res = await fetch(`${API_BASE}/api/decode-outfit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, profile }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error (${res.status})`);
  }

  return res.json();
}

/** Decode outfit from image — vision AI */
export async function decodeOutfitImage(imageBase64, mimeType, profile = null) {
  const res = await fetch(`${API_BASE}/api/decode-outfit-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64, mimeType, profile }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error (${res.status})`);
  }

  return res.json();
}

/** Trend Radar — personalized fashion trends */
export async function getTrends(profile = null) {
  const res = await fetch(`${API_BASE}/api/trends`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error (${res.status})`);
  }

  return res.json();
}
