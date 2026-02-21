const { v4: uuidv4 } = require("uuid");
const { buildPrompt, buildTextPrompt, buildFormPrompt, buildDecodePrompt, buildDecodeImagePrompt, buildTrendPrompt } = require("../prompts/stylingPrompt");
const { getStyleRecommendations, analyzeImageWithVision } = require("../services/groqService");
const { connectDB } = require("../config/db");
const Session = require("../models/Session");

// Helper: save session to DB (non-blocking — never fails the request)
async function saveSession(data) {
  try {
    await connectDB();
    await Session.create(data);
  } catch (err) {
    console.error("MongoDB save failed:", err.message);
  }
}

/**
 * POST /api/analyze — Photo-based analysis (face detection skin tone)
 */
async function analyzeHandler(req, res) {
  const { skinTone, confidence, gender } = req.body;

  try {
    const { systemPrompt, userPrompt } = buildPrompt(skinTone, gender, confidence);
    const start = Date.now();
    const recommendations = await getStyleRecommendations(systemPrompt, userPrompt);
    const durationMs = Date.now() - start;

    const sessionId = uuidv4();
    saveSession({
      sessionId, mode: "photo",
      userProfile: { skinTone, gender },
      input: { confidence },
      result: recommendations,
      durationMs,
    });

    return res.status(200).json({ success: true, sessionId, skinTone, confidence, gender, recommendations });
  } catch (error) {
    console.error("Analysis error:", error);
    if (error.message?.includes("timeout") || error.status === 408) {
      return res.status(504).json({ success: false, message: "AI is taking too long. Please try again." });
    }
    return res.status(500).json({ success: false, message: "Failed to generate recommendations. Please try again." });
  }
}

/**
 * POST /api/analyze-text — Text prompt analysis (no photo)
 */
async function analyzeTextHandler(req, res) {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
    return res.status(400).json({ success: false, message: "Please provide a description of at least 10 characters." });
  }

  try {
    const { systemPrompt, userPrompt } = buildTextPrompt(prompt.trim());
    const start = Date.now();
    const recommendations = await getStyleRecommendations(systemPrompt, userPrompt);
    const durationMs = Date.now() - start;

    const sessionId = uuidv4();
    saveSession({
      sessionId, mode: "text",
      input: { textPrompt: prompt.trim() },
      result: recommendations,
      durationMs,
    });

    return res.status(200).json({ success: true, sessionId, recommendations });
  } catch (error) {
    console.error("Text analysis error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate recommendations. Please try again." });
  }
}

/**
 * POST /api/analyze-form — Form-based analysis (no photo)
 */
async function analyzeFormHandler(req, res) {
  const { gender, ageRange, skinTone, undertone, stylePreferences, occasion, budget } = req.body;

  const errors = [];
  if (!gender) errors.push("gender is required");
  if (!ageRange) errors.push("ageRange is required");
  if (!skinTone) errors.push("skinTone is required");
  if (!undertone) errors.push("undertone is required");
  if (!occasion) errors.push("occasion is required");
  if (!budget) errors.push("budget is required");

  if (errors.length) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  try {
    const formData = { gender, ageRange, skinTone, undertone, stylePreferences: stylePreferences || [], occasion, budget };
    const { systemPrompt, userPrompt } = buildFormPrompt(formData);
    const start = Date.now();
    const recommendations = await getStyleRecommendations(systemPrompt, userPrompt);
    const durationMs = Date.now() - start;

    const sessionId = uuidv4();
    saveSession({
      sessionId, mode: "form",
      userProfile: { skinTone, undertone, gender, budget, ageRange, occasion, stylePreferences: stylePreferences || [] },
      result: recommendations,
      durationMs,
    });

    return res.status(200).json({ success: true, sessionId, skinTone, gender, recommendations });
  } catch (error) {
    console.error("Form analysis error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate recommendations. Please try again." });
  }
}

/**
 * POST /api/decode-outfit — Reverse-engineer an outfit (text description)
 */
async function decodeOutfitHandler(req, res) {
  const { description, profile } = req.body;

  if (!description || typeof description !== "string" || description.trim().length < 15) {
    return res.status(400).json({ success: false, message: "Please describe the outfit in at least 15 characters." });
  }

  try {
    const { systemPrompt, userPrompt } = buildDecodePrompt(description.trim(), profile || null);
    const start = Date.now();
    const decoded = await getStyleRecommendations(systemPrompt, userPrompt);
    const durationMs = Date.now() - start;

    const sessionId = uuidv4();
    saveSession({
      sessionId, mode: "decode-text",
      userProfile: profile ? { skinTone: profile.skinTone, gender: profile.gender, budget: profile.budget } : undefined,
      input: { outfitDescription: description.trim() },
      result: decoded,
      durationMs,
    });

    return res.status(200).json({ success: true, decoded });
  } catch (error) {
    console.error("Decode outfit error:", error);
    return res.status(500).json({ success: false, message: "Failed to decode outfit. Please try again." });
  }
}

/**
 * POST /api/decode-outfit-image — Reverse-engineer an outfit from a photo (vision AI)
 */
async function decodeOutfitImageHandler(req, res) {
  try {
    const { image, mimeType, profile } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "Please upload an outfit image." });
    }

    const cleanBase64 = image.replace(/^data:[^;]+;base64,/, "");
    const mime = mimeType || "image/jpeg";

    const { systemPrompt, userPrompt } = buildDecodeImagePrompt(profile || null);
    const start = Date.now();
    const decoded = await analyzeImageWithVision(systemPrompt, userPrompt, cleanBase64, mime);
    const durationMs = Date.now() - start;

    const sessionId = uuidv4();
    saveSession({
      sessionId, mode: "decode-image",
      userProfile: profile ? { skinTone: profile.skinTone, gender: profile.gender, budget: profile.budget } : undefined,
      result: decoded,
      durationMs,
    });

    return res.status(200).json({ success: true, decoded });
  } catch (error) {
    console.error("Vision decode error:", error.message);
    if (error.status) console.error("HTTP status:", error.status);
    if (error.error) console.error("API error body:", JSON.stringify(error.error, null, 2));
    const userMsg = error.message?.includes("Image could not")
      ? error.message
      : "Failed to analyze outfit image. Please try a different photo or use text mode.";
    return res.status(500).json({ success: false, message: userMsg });
  }
}

/**
 * POST /api/trends — Personalized fashion trend radar
 */
async function trendRadarHandler(req, res) {
  const { profile } = req.body;

  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const seasons = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
  const season = `${seasons[month]} ${year}`;

  try {
    const { systemPrompt, userPrompt } = buildTrendPrompt(season, profile || null);
    const start = Date.now();
    const trends = await getStyleRecommendations(systemPrompt, userPrompt);
    const durationMs = Date.now() - start;

    const sessionId = uuidv4();
    saveSession({
      sessionId, mode: "trend-radar",
      userProfile: profile ? { skinTone: profile.skinTone, undertone: profile.undertone, gender: profile.gender, stylePreferences: profile.stylePreferences } : undefined,
      input: { season },
      result: trends,
      durationMs,
    });

    return res.status(200).json({ success: true, season, trends });
  } catch (error) {
    console.error("Trend radar error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch trends. Please try again." });
  }
}

module.exports = { analyzeHandler, analyzeTextHandler, analyzeFormHandler, decodeOutfitHandler, decodeOutfitImageHandler, trendRadarHandler };
