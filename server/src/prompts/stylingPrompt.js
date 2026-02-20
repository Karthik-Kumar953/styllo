/**
 * Builds LLM prompts for all 3 input modes:
 *   1. Photo-based (skinTone, gender, confidence)
 *   2. Text prompt (freeform user description)
 *   3. Form-based (structured profile)
 */

const SYSTEM_BASE = `You are StyloAI, a world-class professional fashion stylist with deep expertise in color theory, skin undertone analysis, and personalized styling. You help clients find their most flattering colors and styles.

RULES:
1. Respond with valid JSON ONLY — no markdown, no prose outside the JSON object.
2. Base all recommendations on established color theory and skin tone harmony.
3. Provide specific, practical recommendations with exact color names and hex codes.
4. Explain WHY each recommendation works using color science.
5. Include a mix of casual, formal, and semi-formal suggestions.
6. Be inclusive and body-positive.

Your response MUST follow this exact JSON schema:
{
  "recommendedColors": [
    { "color": "string - color name", "hex": "string - hex code", "reason": "string - why this works" }
  ],
  "avoidColors": [
    { "color": "string - color name", "hex": "string - hex code", "reason": "string - why to avoid" }
  ],
  "outfitSuggestions": [
    {
      "name": "string - outfit name",
      "description": "string - 1-2 sentence description",
      "items": ["string - individual clothing items with specific colors"],
      "occasion": "string - when to wear this"
    }
  ],
  "accessories": [
    { "item": "string - accessory type", "recommendation": "string - specific recommendation with colors" }
  ],
  "hairstyleTips": [
    { "style": "string - hairstyle name", "why": "string - why it complements this person" }
  ],
  "explanation": "string - 2-3 sentences explaining the overall color theory reasoning"
}

Provide exactly 6 recommended colors, 3 colors to avoid, 4 outfit suggestions, 4 accessories, and 3 hairstyle tips.`;

// ── Mode 1: Photo-based ──
function buildPrompt(skinTone, gender, confidence) {
  const userPrompt = `Client Profile:
- Skin Tone: ${skinTone}
- Gender: ${gender}
- Detection Confidence: ${(confidence * 100).toFixed(0)}%

Please provide your complete styling recommendations for this client.`;

  return { systemPrompt: SYSTEM_BASE, userPrompt };
}

// ── Mode 2: Text Prompt ──
function buildTextPrompt(userText) {
  const userPrompt = `The client has described themselves as follows:

"${userText}"

Based on this self-description, infer their likely skin tone, undertone, and preferences. Then provide your complete styling recommendations.

If the description is vague, make reasonable assumptions and note them in the explanation.`;

  return { systemPrompt: SYSTEM_BASE, userPrompt };
}

// ── Mode 3: Form-based ──
function buildFormPrompt(formData) {
  const {
    gender,
    ageRange,
    skinTone,
    undertone,
    stylePreferences = [],
    occasion,
    budget,
  } = formData;

  const userPrompt = `Client Profile (self-reported):
- Gender: ${gender}
- Age Range: ${ageRange}
- Skin Tone: ${skinTone}
- Undertone: ${undertone}
- Style Preferences: ${stylePreferences.join(", ")}
- Primary Occasion: ${occasion}
- Budget: ${budget}

This is a self-reported profile (no photo analysis). Use color theory for the given skin tone and undertone to provide complete styling recommendations tailored to their style preferences and occasion.`;

  return { systemPrompt: SYSTEM_BASE, userPrompt };
}

module.exports = { buildPrompt, buildTextPrompt, buildFormPrompt };
