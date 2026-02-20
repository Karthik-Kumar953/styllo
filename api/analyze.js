// Vercel Serverless Function — thin wrapper around the server logic
const { v4: uuidv4 } = require("uuid");
const Groq = require("groq-sdk");
const mongoose = require("mongoose");

// ── MongoDB Connection (cached for serverless) ──
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Session Model ──
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  skinTone: { type: String, required: true, enum: ["Fair", "Medium", "Olive", "Deep"] },
  confidence: { type: Number, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  recommendations: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

// ── Prompt Builder ──
function buildPrompt(skinTone, gender, confidence) {
  const systemPrompt = `You are StyloAI, a world-class professional fashion stylist with deep expertise in color theory, skin undertone analysis, and personalized styling.

RULES:
1. Respond with valid JSON ONLY — no markdown, no prose outside the JSON object.
2. Base all recommendations on established color theory and skin tone harmony.
3. Provide specific, practical recommendations with exact color names and hex codes.
4. Explain WHY each recommendation works using color science.
5. Include a mix of casual, formal, and semi-formal suggestions.
6. Be inclusive and body-positive.

Your response MUST follow this exact JSON schema:
{
  "recommendedColors": [{ "color": "string", "hex": "string", "reason": "string" }],
  "avoidColors": [{ "color": "string", "hex": "string", "reason": "string" }],
  "outfitSuggestions": [{ "name": "string", "description": "string", "items": ["string"], "occasion": "string" }],
  "accessories": [{ "item": "string", "recommendation": "string" }],
  "hairstyleTips": [{ "style": "string", "why": "string" }],
  "explanation": "string"
}

Provide exactly 6 recommended colors, 3 colors to avoid, 4 outfit suggestions, 4 accessories, and 3 hairstyle tips.`;

  const userPrompt = `Client Profile:\n- Skin Tone: ${skinTone}\n- Gender: ${gender}\n- Detection Confidence: ${(confidence * 100).toFixed(0)}%\n\nPlease provide your complete styling recommendations.`;

  return { systemPrompt, userPrompt };
}

// ── Handler ──
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { skinTone, confidence, gender } = req.body || {};

  // Validate
  const errors = [];
  if (!skinTone || !["Fair", "Medium", "Olive", "Deep"].includes(skinTone))
    errors.push("skinTone must be one of: Fair, Medium, Olive, Deep");
  if (confidence === undefined || typeof confidence !== "number" || confidence < 0 || confidence > 1)
    errors.push("confidence must be a number between 0 and 1");
  if (!gender || !["Male", "Female"].includes(gender))
    errors.push("gender must be one of: Male, Female");
  if (errors.length) return res.status(400).json({ success: false, message: "Validation failed", errors });

  try {
    const { systemPrompt, userPrompt } = buildPrompt(skinTone, gender, confidence);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty LLM response");

    const recommendations = JSON.parse(content);
    const sessionId = uuidv4();

    // Save to DB (non-blocking failure)
    try {
      await connectDB();
      await Session.create({ sessionId, skinTone, confidence, gender, recommendations });
    } catch (dbErr) {
      console.error("MongoDB save failed:", dbErr.message);
    }

    return res.status(200).json({ success: true, sessionId, skinTone, confidence, gender, recommendations });
  } catch (error) {
    console.error("Analysis error:", error);
    const status = error.message?.includes("timeout") ? 504 : 500;
    return res.status(status).json({ success: false, message: "Failed to generate recommendations. Please try again." });
  }
};
