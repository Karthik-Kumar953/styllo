import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Loader2, ArrowLeft, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  { text: "I'm a 25-year-old man with medium brown skin and warm undertone. I prefer smart casual style.", emoji: "👨" },
  { text: "I'm a woman in my 30s with fair skin and cool pink undertone. Looking for professional outfits.", emoji: "👩" },
  { text: "I'm a college student with deep dark skin and warm golden undertone. I love streetwear.", emoji: "🧢" },
  { text: "I have olive skin with neutral undertone. I need outfits for a wedding.", emoji: "💒" },
  { text: "I'm a teenage girl with light skin and warm peachy undertone. I like minimalist aesthetic.", emoji: "🤍" },
  { text: "I'm a 40-year-old man with dark brown skin. I need formal and business casual recommendations.", emoji: "👔" },
];

export default function TextPrompt({ onSubmit, onBack }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (text.trim().length < 10) {
      setError("Please provide at least 10 characters describing yourself.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(text.trim());
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-6">
      <div className="w-full text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Describe Your <span className="gradient-text">Style</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          No photo? No problem! Describe yourself and we'll generate personalized recommendations.
        </p>
      </div>

      {/* Text area */}
      <div className="w-full max-w-md">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null); }}
            placeholder="Describe your skin tone, age, gender, style preferences, and what occasion you're dressing for..."
            rows={5}
            className="w-full px-4 py-3.5 rounded-xl bg-surface-800/80 border border-white/10 text-white text-sm placeholder-zinc-600 resize-none focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {text.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                text.length >= 10 ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-500"
              }`}>
                {text.length >= 10 ? "✓ Ready" : `${text.length}/10`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-xs text-zinc-500 font-medium">Tap a suggestion to get started</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setText(s.text)}
              className={`cursor-pointer text-left px-4 py-3 rounded-xl flex items-start gap-3 transition-all ${
                text === s.text
                  ? "bg-gradient-to-r from-primary-600/15 to-transparent border border-primary-500/30 text-zinc-200"
                  : "glass text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-base mt-0.5 shrink-0">{s.emoji}</span>
              <span className="text-xs leading-relaxed">"{s.text}"</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-md">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading || text.trim().length < 10}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            !loading && text.trim().length >= 10
              ? "bg-gradient-to-r from-cyan-600 via-blue-500 to-primary-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
              : "bg-surface-700 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Send className="w-4 h-4" /> Get Recommendations</>
          )}
        </motion.button>
      </div>

      <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to options
      </button>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20"
        >
          {error}
        </motion.div>
      )}

      <p className="text-zinc-600 text-xs text-center">
        <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-cyan-500" />
        Powered by AI — your description is analyzed to generate personalized fashion advice
      </p>
    </div>
  );
}
