import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Shirt, Gem, Scissors, Sparkles, RotateCcw, AlertCircle, ShoppingBag, ExternalLink, Dna, Download, Crown, Star } from "lucide-react";
import { generateShoppingLinks } from "../utils/affiliateLinks";
import StyleDNACard from "./StyleDNACard";

const TONE_COLORS = {
  Fair: "#FDDCB5", Medium: "#D4A574", Olive: "#A67C52", Deep: "#6B4226",
};

const sectionAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ResultsView({ data, gender, onRestart }) {
  const [showDNACard, setShowDNACard] = useState(false);

  if (!data?.recommendations) return null;
  const r = data.recommendations;
  const dna = r.styleDNA;
  const outfitsWithLinks = generateShoppingLinks(data.skinTone, gender, r.outfitSuggestions || []);

  return (
    <div className="w-full flex flex-col gap-8 pt-4 pb-8">

      {/* ── Hero Card — full width ── */}
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full relative overflow-hidden rounded-2xl glass glow-purple"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary-600/10 via-transparent to-rose-500/10" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 lg:p-10">
          {/* Skin tone swatch */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl border-4 border-surface-900 shrink-0"
            style={{ backgroundColor: TONE_COLORS[data.skinTone] || "#D4A574" }}
          />
          {/* Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">{data.skinTone} Skin Tone</h2>
            <p className="text-zinc-400 text-sm mb-3">Your personalized style guide is ready</p>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-36 h-2 rounded-full bg-surface-700 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.confidence * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full rounded-full bg-linear-to-r from-primary-400 to-accent-400"
                />
              </div>
              <span className="text-sm text-zinc-300 font-medium">{Math.round(data.confidence * 100)}% match</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Style DNA Section — NEW ── */}
      {dna && (
        <motion.section custom={0.5} variants={sectionAnim} initial="hidden" animate="visible" className="w-full">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-primary-400"><Dna className="w-5 h-5" /></span>
            <h3 className="font-display font-semibold text-white text-lg">Your Style DNA</h3>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-primary-600/10 to-transparent rounded-bl-full pointer-events-none" />

            {/* Archetype + Tagline */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Style Archetype</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">{dna.archetype}</h2>
              <p className="text-zinc-400 text-sm italic">"{dna.tagline}"</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 relative z-10">
              <DNAStat label="Color Season" value={dna.colorSeason} />
              <DNAStat label="Metal Match" value={dna.metalMatch} />
              <DNAStat label="Pattern" value={dna.signaturePattern} />
              <DNAStat label="Style Score" value={`${dna.styleScore || 85}/100`} />
            </div>

            {/* Fabrics */}
            {dna.bestFabrics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
                {dna.bestFabrics.map((f, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-surface-700/80 text-zinc-300 text-xs font-medium border border-white/5">
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Celebrity + Share Button */}
            <div className="flex items-center justify-between relative z-10">
              {dna.celebrityMatch && (
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-sm text-zinc-400">Style Twin: <strong className="text-primary-300">{dna.celebrityMatch}</strong></span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowDNACard(true)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-500 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Generate Shareable Card
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── DNA Card Modal ── */}
      <AnimatePresence>
        {showDNACard && (
          <StyleDNACard
            dna={dna}
            colors={r.recommendedColors}
            skinTone={data.skinTone}
            onClose={() => setShowDNACard(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Two-column layout for desktop ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8">

          {/* Recommended Colors */}
          {r.recommendedColors?.length > 0 && (
            <Section icon={<Palette className="w-5 h-5" />} title="Your Color Palette" i={1}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {r.recommendedColors.map((c, j) => (
                  <motion.div key={j} initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 + j * 0.05 } }}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl glass"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg shadow-md border border-white/10"
                      style={{ backgroundColor: c.hex }} />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{c.color}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{c.hex}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Avoid Colors */}
          {r.avoidColors?.length > 0 && (
            <Section icon={<AlertCircle className="w-5 h-5" />} title="Colors to Avoid" i={2}>
              <div className="flex flex-wrap gap-2">
                {r.avoidColors.map((c, j) => (
                  <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/15">
                    <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs text-red-300">{c.color}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Accessories */}
          {r.accessories?.length > 0 && (
            <Section icon={<Gem className="w-5 h-5" />} title="Accessories" i={4}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {r.accessories.map((a, j) => (
                  <div key={j} className="p-4 rounded-xl glass">
                    <p className="text-sm font-semibold text-primary-300 mb-1.5">{a.item}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{a.recommendation}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Hairstyle Tips */}
          {r.hairstyleTips?.length > 0 && (
            <Section icon={<Scissors className="w-5 h-5" />} title="Hairstyle Tips" i={5}>
              <div className="flex flex-col gap-3">
                {r.hairstyleTips.map((h, j) => (
                  <div key={j} className="flex gap-4 p-4 rounded-xl glass items-start">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-linear-to-br from-primary-600/30 to-rose-500/20 flex items-center justify-center text-sm font-bold text-primary-300">
                      {j + 1}
                    </div>
                    <div>
                      <p className="text-sm text-white font-semibold">{h.style}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{h.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-8">

          {/* Outfit Suggestions */}
          {r.outfitSuggestions?.length > 0 && (
            <Section icon={<Shirt className="w-5 h-5" />} title="Outfit Ideas" i={3}>
              <div className="flex flex-col gap-4">
                {r.outfitSuggestions.map((o, j) => (
                  <motion.div key={j} initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + j * 0.06 } }}
                    className="p-5 rounded-2xl glass"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display font-bold text-white">{o.name}</h4>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-600/20 text-primary-300 shrink-0 ml-2 font-medium whitespace-nowrap">
                        {o.occasion}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-3">{o.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {o.items?.map((it, k) => (
                        <span key={k} className="text-xs px-2.5 py-1 rounded-lg bg-surface-700/80 text-zinc-300 border border-white/5">
                          {it}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Shop the Look */}
          {outfitsWithLinks.length > 0 && (
            <Section icon={<ShoppingBag className="w-5 h-5" />} title="Shop the Look" i={7}>
              <div className="flex flex-col gap-4">
                {outfitsWithLinks.map((outfit, i) => (
                  <div key={i} className="p-4 rounded-xl glass">
                    <h4 className="text-sm font-semibold text-white mb-3">{outfit.name}</h4>
                    <div className="flex flex-col gap-2">
                      {outfit.links.map((link, j) => (
                        <motion.a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="cursor-pointer flex items-center justify-between px-4 py-2.5 rounded-lg bg-linear-to-r from-primary-600/15 to-rose-500/10 border border-primary-500/20 text-primary-200 text-xs hover:border-primary-400/40 transition-colors"
                        >
                          <span className="truncate mr-2">{link.item}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* ── Full-width bottom sections ── */}

      {/* Explanation */}
      {r.explanation && (
        <Section icon={<Sparkles className="w-5 h-5" />} title="Why This Works" i={6}>
          <div className="p-6 rounded-xl glass">
            <p className="text-zinc-300 text-sm leading-relaxed">{r.explanation}</p>
          </div>
        </Section>
      )}

      {/* Restart */}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onRestart}
        className="cursor-pointer w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-xl glass hover:bg-white/4 text-zinc-300 font-medium text-sm transition-all"
      >
        <RotateCcw className="w-4 h-4" /> Analyze Another Photo
      </motion.button>
    </div>
  );
}

function DNAStat({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-surface-900/60 border border-white/5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1">{label}</p>
      <p className="text-sm font-bold text-zinc-200">{value || "—"}</p>
    </div>
  );
}

function Section({ icon, title, i, children }) {
  return (
    <motion.section custom={i} variants={sectionAnim} initial="hidden" animate="visible" className="w-full">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-primary-400">{icon}</span>
        <h3 className="font-display font-semibold text-white text-lg">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}
