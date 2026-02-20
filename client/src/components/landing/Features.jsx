import { motion } from "framer-motion";
import { Shield, Microscope, Brain, Zap, ShoppingBag, Smartphone } from "lucide-react";

const features = [
  {
    icon: Microscope,
    title: "Color Science",
    desc: "LAB color space analysis with K-Means clustering for accurate skin tone detection.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Brain,
    title: "AI Stylist",
    desc: "LLaMA 3.3 70B generates hyper-personalized fashion recommendations.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Shield,
    title: "100% Private",
    desc: "Your photo never leaves the browser. All processing happens on your device.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Instant Results",
    desc: "Get personalized color palette, outfits, and styling tips in under 10 seconds.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: ShoppingBag,
    title: "Shop Ready",
    desc: "Direct shopping links for every recommended item. Click and buy instantly.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Designed for on-the-go styling. Works beautifully on any device.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">
            Why Styllo
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Fashion Meets <span className="gradient-text">Science</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-center">
            We combine computer vision, color theory, and generative AI to give you
            styling advice that actually works for your unique skin tone.
          </p>
        </motion.div>

        {/* Feature Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-6 sm:p-7 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
            >
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
