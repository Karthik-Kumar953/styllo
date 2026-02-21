/**
 * Builds LLM prompts for all input modes:
 *   1. Photo-based (skinTone, gender, confidence)
 *   2. Text prompt (freeform user description)
 *   3. Form-based (structured profile)
 *   4. Decode outfit (reverse-engineer an outfit)
 *   5. Trend radar (personalized fashion trends)
 */

const STYLE_DNA_SCHEMA = `
  "styleDNA": {
    "archetype": "string — a creative 2-3 word style persona title, e.g. 'The Sunset Minimalist', 'Urban Royalty', 'Earthy Bohemian'",
    "tagline": "string — a poetic, aspirational 1-liner about their style identity, e.g. 'You carry warmth like molten gold — effortless yet unforgettable'",
    "colorSeason": "string — one of: Spring, Summer, Autumn, Winter (based on color analysis)",
    "seasonDescription": "string — 1 sentence explaining why this season fits them",
    "metalMatch": "string — Gold, Silver, or Rose Gold — whichever complements their tone best",
    "bestFabrics": ["string — top 3 fabrics that suit them, e.g. 'Silk', 'Linen', 'Cashmere'"],
    "styleScore": "number — 1-100 overall style compatibility confidence score",
    "celebrityMatch": "string — name of a well-known celebrity or style icon with a similar style profile",
    "signaturePattern": "string — the pattern type that suits them best, e.g. 'Subtle Florals', 'Geometric Prints', 'Solid Tones'"
  }`;

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
  "explanation": "string - 2-3 sentences explaining the overall color theory reasoning",
  ${STYLE_DNA_SCHEMA}
}

Provide exactly 6 recommended colors, 3 colors to avoid, 4 outfit suggestions, 4 accessories, and 3 hairstyle tips. The styleDNA section is MANDATORY.`;

// ── Mode 1: Photo-based ──
function buildPrompt(skinTone, gender, confidence) {
  const userPrompt = `Client Profile:
- Skin Tone: ${skinTone}
- Gender: ${gender}
- Detection Confidence: ${(confidence * 100).toFixed(0)}%

Please provide your complete styling recommendations for this client, including their Style DNA profile.`;

  return { systemPrompt: SYSTEM_BASE, userPrompt };
}

// ── Mode 2: Text Prompt ──
function buildTextPrompt(userText) {
  const userPrompt = `The client has described themselves as follows:

"${userText}"

Based on this self-description, infer their likely skin tone, undertone, and preferences. Then provide your complete styling recommendations including their Style DNA profile.

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
- Style Preferences: ${stylePreferences.join(", ") || "None specified"}
- Primary Occasion: ${occasion}
- Budget: ${budget}

This is a self-reported profile (no photo analysis). Use color theory for the given skin tone and undertone to provide complete styling recommendations tailored to their style preferences and occasion. Include their Style DNA profile.`;

  return { systemPrompt: SYSTEM_BASE, userPrompt };
}

// ── Mode 4: Decode Outfit ──
function buildDecodePrompt(outfitDescription, userProfile) {
  const systemPrompt = `You are StyloAI, a world-class fashion stylist. A user has seen an outfit they love and wants to recreate it adapted to their own profile.

RULES:
1. Respond with valid JSON ONLY.
2. First, break down the described outfit into individual pieces.
3. Then adapt each piece to the user's skin tone and budget.
4. Provide specific shopping-ready descriptions with colors and fabrics.

Your response MUST follow this JSON schema:
{
  "originalBreakdown": [
    {
      "piece": "string — clothing item name",
      "color": "string — detected color",
      "fabric": "string — estimated fabric",
      "role": "string — role in the outfit (e.g. 'statement piece', 'base layer', 'accent')"
    }
  ],
  "adaptedOutfit": {
    "summary": "string — 1-2 sentence overview of how the outfit is adapted",
    "pieces": [
      {
        "piece": "string — adapted item name",
        "originalColor": "string — color from the original",
        "adaptedColor": "string — color adjusted for user's skin tone",
        "adaptedHex": "string — hex code of adapted color",
        "fabric": "string — recommended fabric",
        "priceRange": "string — estimated price range based on budget",
        "searchQuery": "string — shopping search keyword for this item"
      }
    ]
  },
  "stylingTips": ["string — 3 tips for pulling off this look"],
  "whyItWorks": "string — 2-3 sentences on why this adapted outfit works for the user's coloring"
}`;

  const profileInfo = userProfile
    ? `\n\nUser's Profile:\n- Skin Tone: ${userProfile.skinTone || "Not specified"}\n- Undertone: ${userProfile.undertone || "Not specified"}\n- Gender: ${userProfile.gender || "Not specified"}\n- Budget: ${userProfile.budget || "Mid-Range"}`
    : "\n\nNo user profile available — provide general recommendations.";

  const userPrompt = `The user saw this outfit and wants to recreate it:\n\n"${outfitDescription}"${profileInfo}\n\nPlease break down this outfit, adapt it to the user's profile, and provide shopping-ready recommendations.`;

  return { systemPrompt, userPrompt };
}

// ── Mode 4b: Decode Outfit from IMAGE (vision) ──
function buildDecodeImagePrompt(userProfile) {
  const systemPrompt = `You are StyloAI, a world-class fashion analyst with expert visual analysis skills. Your PRIMARY job is to ACCURATELY identify and decode every visible item in the outfit photo.

CRITICAL RULES:
1. Respond with valid JSON ONLY — no markdown, no extra text.
2. Your MAIN goal is to faithfully describe EXACTLY what is in the photo — do NOT invent items or change what the person is wearing.
3. For originalBreakdown: list EVERY visible piece (clothing, shoes, accessories, jewelry, bags) with accurate colors and fabrics as seen in the image.
4. For adaptedOutfit: keep the SAME clothing items and silhouettes. Only make SUBTLE color or shade adjustments to better complement the user's skin tone. Do NOT change a shirt to a different type of shirt or pants to a different style — maintain the same look.
5. The searchQuery must match what the person is ACTUALLY wearing so they can find the same/similar items.

Your response MUST follow this JSON schema:
{
  "originalBreakdown": [
    {
      "piece": "string — exact clothing item visible in the photo",
      "color": "string — accurate color as seen in the photo",
      "fabric": "string — best estimate of the fabric",
      "role": "string — role in outfit (e.g. 'Statement Piece', 'Base Layer', 'Accessory', 'Footwear')"
    }
  ],
  "adaptedOutfit": {
    "summary": "string — brief explanation of any subtle color adjustments made (or 'No changes needed — this outfit already works well for your skin tone')",
    "pieces": [
      {
        "piece": "string — SAME item type as original, with minor color/shade adjustment",
        "originalColor": "string — the exact color from the photo",
        "adaptedColor": "string — adjusted shade (can be the same if it already works)",
        "adaptedHex": "string — hex code of adapted color",
        "fabric": "string — same or upgraded fabric suggestion",
        "priceRange": "string — estimated price range",
        "searchQuery": "string — search keyword to find this EXACT type of item"
      }
    ]
  },
  "stylingTips": ["string — 3 tips for elevating this specific look"],
  "whyItWorks": "string — 2-3 sentences about how this outfit works and any improvements suggested"
}`;

  const profileInfo = userProfile
    ? `\n\nUser Profile:\n- Skin Tone: ${userProfile.skinTone || "Not specified"}\n- Gender: ${userProfile.gender || "Not specified"}\n- Budget: ${userProfile.budget || "Mid-Range"}`
    : "\n\nNo profile — provide general analysis.";

  const userPrompt = `Look at this outfit photo carefully. Identify and describe EVERY visible clothing item, accessory, shoe, and color EXACTLY as they appear. Then provide subtle color adjustments if needed for the user's skin tone — but keep the same items and style.${profileInfo}`;

  return { systemPrompt, userPrompt };
}

// ── Mode 5: Trend Radar ──
function buildTrendPrompt(season, userProfile) {
  const systemPrompt = `You are StyloAI, a fashion trend analyst. Provide current fashion trends for the given season, personalized to the user's profile.

RULES:
1. Respond with valid JSON ONLY.
2. Focus on trends that are accessible and wearable.
3. Personalize each trend to the user's skin tone and style.
4. Include both clothing and color trends.

Your response MUST follow this JSON schema:
{
  "season": "string — the current season and year",
  "trendSummary": "string — 2-3 sentence overview of this season's fashion direction",
  "trends": [
    {
      "name": "string — trend name",
      "description": "string — what this trend is about",
      "forYou": "string — how this trend works specifically for the user's skin tone and style",
      "rating": "number — 1-5 compatibility rating with the user's profile",
      "keyColors": [
        { "color": "string", "hex": "string" }
      ],
      "examplePieces": ["string — 2-3 specific items to try"],
      "avoid": "string — what to watch out for with this trend"
    }
  ],
  "topPick": {
    "trendName": "string — the #1 most recommended trend for this user",
    "reason": "string — why this is their top pick"
  }
}

Provide exactly 6 trends.`;

  const profileInfo = userProfile
    ? `User's Profile:\n- Skin Tone: ${userProfile.skinTone || "Not specified"}\n- Undertone: ${userProfile.undertone || "Not specified"}\n- Gender: ${userProfile.gender || "Not specified"}\n- Style Preferences: ${userProfile.stylePreferences?.join(", ") || "Not specified"}`
    : "No user profile available — provide general trend recommendations.";

  const userPrompt = `Current Season: ${season}\n\n${profileInfo}\n\nProvide personalized fashion trend recommendations for this season.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildPrompt, buildTextPrompt, buildFormPrompt, buildDecodePrompt, buildDecodeImagePrompt, buildTrendPrompt };
