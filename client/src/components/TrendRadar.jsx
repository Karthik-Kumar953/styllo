import { useState } from "react";
import { motion } from "framer-motion";
import {
  Radar, ArrowLeft, Loader2, Star, TrendingUp,
  AlertTriangle, Palette, Shirt, Sparkles, Crown,
  ShoppingBag, ExternalLink
} from "lucide-react";
import { getTrends } from "../services/api";
import { generateTrendAffiliateLink } from "../utils/affiliateLinks";

export default function TrendRadar({ onBack }) {
  const [profile, setProfile] = useState({ skinTone: "", gender: "", undertone: "", stylePreferences: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const STYLE_OPTS = ["Casual", "Formal", "Streetwear", "Minimalist", "Ethnic", "Sporty", "Vintage"];

  const toggleStyle = (s) => {
    setProfile(p => ({
      ...p,
      stylePreferences: p.stylePreferences.includes(s)
        ? p.stylePreferences.filter(x => x !== s)
        : [...p.stylePreferences, s]
    }));
  };

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTrends(profile.skinTone ? profile : null);
      setResult(res.trends);
    } catch (err) {
      setError(err.message || "Failed to load trends.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pt-4 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Trend <span className="gradient-text">Radar</span>
        </h2>
        <p className="text-zinc-500 text-sm">Discover what's trending this season — personalized for you</p>
      </div>

      {!result ? (
        <div className="flex flex-col gap-6">
          {/* Profile */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 block">
              Personalize your trends <span className="text-zinc-700">(optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <select value={profile.skinTone} onChange={e => setProfile(p => ({ ...p, skinTone: e.target.value }))}
                className="cursor-pointer generic-input text-xs">
                <option value="">Skin Tone</option>
                {["Fair", "Light", "Medium", "Olive", "Deep", "Dark"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                className="cursor-pointer generic-input text-xs">
                <option value="">Gender</option>
                {["Male", "Female", "Non-binary"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={profile.undertone} onChange={e => setProfile(p => ({ ...p, undertone: e.target.value }))}
                className="cursor-pointer generic-input text-xs">
                <option value="">Undertone</option>
                {["Warm", "Cool", "Neutral"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Style preferences</p>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_OPTS.map(s => (
                <button key={s} onClick={() => toggleStyle(s)}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wide transition-all ${
                    profile.stylePreferences.includes(s)
                      ? "bg-primary-600/20 border-primary-500 text-primary-300"
                      : "bg-surface-900/40 border-white/5 text-zinc-500 hover:border-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="w-full text-center py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            onClick={handleFetch}
            disabled={loading}
            className={`cursor-pointer w-full py-4 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
              !loading
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-500"
                : "bg-surface-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Scanning Trends...</>
            ) : (
              <><Radar className="w-4 h-4" /> Discover Trends</>
            )}
          </motion.button>

          <button onClick={onBack} className="cursor-pointer mx-auto flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-semibold uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      ) : (
        /* ─── Results ─── */
        <div className="flex flex-col gap-6">
          {/* Season & Summary */}
          <div className="glass rounded-2xl p-6 border border-white/5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-1">
              {result.season || "This Season"}
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">{result.trendSummary}</p>
          </div>

          {/* Top Pick */}
          {result.topPick && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-5 border border-primary-500/20 bg-linear-to-r from-primary-600/5 to-rose-500/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  #1 Top Pick For You
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-1">{result.topPick.trendName}</h3>
              <p className="text-sm text-zinc-400">{result.topPick.reason}</p>
            </motion.div>
          )}

          {/* Trends Grid */}
          <div className="flex flex-col gap-4">
            {result.trends?.map((trend, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                className="glass rounded-2xl p-5 border border-white/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display font-bold text-white text-base">{trend.name}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{trend.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < (trend.rating || 0) ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                    ))}
                  </div>
                </div>

                {/* For You */}
                <div className="p-3 rounded-lg bg-primary-600/5 border border-primary-500/10 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-primary-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-300">For You</span>
                  </div>
                  <p className="text-xs text-zinc-300">{trend.forYou}</p>
                </div>

                {/* Key Colors */}
                {trend.keyColors?.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-3 h-3 text-zinc-500" />
                    <div className="flex gap-1.5">
                      {trend.keyColors.map((c, j) => (
                        <div key={j} className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: c.hex }} />
                          <span className="text-[10px] text-zinc-500">{c.color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example Pieces */}
                {trend.examplePieces?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {trend.examplePieces.map((p, j) => (
                      <a key={j}
                        href={generateTrendAffiliateLink(trend.name, p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/piece text-[10px] px-2 py-1 rounded-lg bg-surface-700/80 text-zinc-400 border border-white/5 hover:border-primary-500/30 hover:text-primary-300 transition-all inline-flex items-center gap-1"
                      >
                        {p}
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/piece:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Avoid */}
                {trend.avoid && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-zinc-500">{trend.avoid}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setResult(null)}
              className="cursor-pointer flex-1 py-3 rounded-xl glass text-zinc-300 text-sm font-medium hover:text-white transition-colors flex items-center justify-center gap-2">
              <Radar className="w-4 h-4" /> Refresh Trends
            </button>
            <button onClick={onBack}
              className="cursor-pointer flex-1 py-3 rounded-xl glass text-zinc-300 text-sm font-medium hover:text-white transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
