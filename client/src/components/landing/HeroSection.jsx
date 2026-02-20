import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Brain } from "lucide-react";

const SKIN_TONES = [
  { color: "#FDDCB5", label: "Fair" },
  { color: "#D4A574", label: "Medium" },
  { color: "#A67C52", label: "Olive" },
  { color: "#6B4226", label: "Deep" },
];

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="w-full relative min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 pt-20 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[150px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[130px] animate-[pulse-glow_8s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-xs"
        >
          <Brain className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-zinc-300">AI-Powered Fashion Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6"
        >
          Discover Your{" "}
          <span className="gradient-text">Perfect Colors</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Upload a selfie. Our AI analyzes your skin tone using color science and
          delivers personalized fashion recommendations — colors, outfits, and
          shopping links — in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.35)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-rose-500 text-white font-semibold text-sm shadow-xl shadow-primary-500/20 transition-shadow"
          >
            Analyze My Style
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <a
            href="#how-it-works"
            className="px-8 py-3.5 rounded-full border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-colors"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Skin Tone Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="flex -space-x-2">
            {SKIN_TONES.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                className="w-10 h-10 rounded-full border-2 border-surface-950 shadow-lg"
                style={{ backgroundColor: t.color }}
                title={t.label}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500">
            Works for all skin tones
          </span>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> 100% Private
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-400" /> Instant Results
          </span>
          <span className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-primary-400" /> AI-Powered
          </span>
        </motion.div>
      </div>
    </section>
  );
}
