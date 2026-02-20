const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  mode:       { type: String, enum: ["photo", "text", "form"], default: "photo" },

  // Photo mode fields
  skinTone:   { type: String },
  confidence: { type: Number, min: 0, max: 1 },
  gender:     { type: String },

  // Text mode
  textPrompt: { type: String },

  // Form mode
  formData:   { type: mongoose.Schema.Types.Mixed },

  // Result
  recommendations: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.models.Session || mongoose.model("Session", sessionSchema);
