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
