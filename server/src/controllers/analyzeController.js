const { v4: uuidv4 } = require("uuid");
const { buildPrompt, buildTextPrompt, buildFormPrompt } = require("../prompts/stylingPrompt");
const { getStyleRecommendations } = require("../services/groqService");
const { connectDB } = require("../config/db");
const Session = require("../models/Session");

/**
 * POST /api/analyze — Photo-based analysis
 */
async function analyzeHandler(req, res) {
  const { skinTone, confidence, gender } = req.body;

  try {
    const { systemPrompt, userPrompt } = buildPrompt(skinTone, gender, confidence);
    const recommendations = await getStyleRecommendations(systemPrompt, userPrompt);
    const sessionId = uuidv4();

    try {
      await connectDB();
      await Session.create({ sessionId, skinTone, confidence, gender, recommendations, mode: "photo" });
    } catch (dbErr) {
      console.error("MongoDB save failed:", dbErr.message);
    }

    return res.status(200).json({
      success: true, sessionId, skinTone, confidence, gender, recommendations,
    });
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
    const recommendations = await getStyleRecommendations(systemPrompt, userPrompt);
    const sessionId = uuidv4();

    try {
      await connectDB();
      await Session.create({ sessionId, textPrompt: prompt, recommendations, mode: "text" });
    } catch (dbErr) {
      console.error("MongoDB save failed:", dbErr.message);
    }

    return res.status(200).json({
      success: true, sessionId, recommendations,
    });
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
    const recommendations = await getStyleRecommendations(systemPrompt, userPrompt);
    const sessionId = uuidv4();

    try {
      await connectDB();
      await Session.create({ sessionId, formData, recommendations, mode: "form" });
    } catch (dbErr) {
      console.error("MongoDB save failed:", dbErr.message);
    }

    return res.status(200).json({
      success: true, sessionId, skinTone, gender, recommendations,
    });
  } catch (error) {
    console.error("Form analysis error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate recommendations. Please try again." });
  }
}

module.exports = { analyzeHandler, analyzeTextHandler, analyzeFormHandler };
