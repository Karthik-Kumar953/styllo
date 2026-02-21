const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  mode: {
    type: String,
    enum: ["photo", "live-capture", "text", "form", "decode-text", "decode-image", "trend-radar"],
    required: true,
    index: true,
  },

  // ── Shared user profile (when available) ──
  userProfile: {
    skinTone:         String,
    undertone:        String,
    gender:           String,
    budget:           String,
    ageRange:         String,
    occasion:         String,
    stylePreferences: [String],
  },

  // ── Mode-specific input ──
  input: {
    // photo / live-capture
    confidence:        Number,

    // text
    textPrompt:        String,

    // decode-text
    outfitDescription: String,

    // trend-radar
    season:            String,
  },

  // ── AI result (flexible — works for recommendations, decoded outfit, trends) ──
  result: { type: mongoose.Schema.Types.Mixed, required: true },

  // ── Metadata ──
  aiModel:    { type: String, default: "llama-4-scout" },
  durationMs: { type: Number },
  createdAt:  { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.models.Session || mongoose.model("Session", sessionSchema);
