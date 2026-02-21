const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Current Groq model as of Feb 2026 (Llama 4 Scout replaced all Llama 3.x models)
const TEXT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

/**
 * Text-only LLM call — used for style recommendations, trends, decode-outfit (text mode)
 */
async function getStyleRecommendations(systemPrompt, userPrompt) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    model: TEXT_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  return JSON.parse(content);
}

/**
 * Vision LLM call — used for image-based outfit decoding.
 * Uses Llama 4 Scout which supports multimodal (text + image) input.
 */
async function analyzeImageWithVision(systemPrompt, userPrompt, imageBase64, mimeType = "image/jpeg") {
  try {
    console.log(`[Vision] Calling ${VISION_MODEL}...`);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      model: VISION_MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty LLM vision response");

    console.log(`[Vision] Response received (${content.length} chars)`);

    // Try direct JSON parse first, then extract from markdown fences
    try {
      return JSON.parse(content);
    } catch {
      const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) return JSON.parse(fenceMatch[1].trim());

      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) return JSON.parse(braceMatch[0]);

      console.error("[Vision] No JSON found in:", content.substring(0, 300));
      throw new Error("Could not parse JSON from vision response");
    }
  } catch (error) {
    console.error("[Vision] Error:", error.message);
    if (error.error?.message) console.error("[Vision] API detail:", error.error.message);
    throw error;
  }
}

module.exports = { getStyleRecommendations, analyzeImageWithVision };
