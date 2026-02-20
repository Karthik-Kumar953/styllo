const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getStyleRecommendations(systemPrompt, userPrompt) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    response_format: { type: "json_object" },
    max_tokens: 2048,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  return JSON.parse(content);
}

module.exports = { getStyleRecommendations };
