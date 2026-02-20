import { motion } from "framer-motion";
import { Camera, ScanFace, Palette, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Camera,
    num: "01",
    title: "Upload Your Selfie",
    desc: "Take or upload a clear, well-lit photo. It stays on your device — never uploaded anywhere.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: ScanFace,
    num: "02",
    title: "AI Analyzes Your Skin",
    desc: "MediaPipe detects your face. Our engine samples skin pixels, converts to LAB color space, and runs K-Means clustering.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Palette,
    num: "03",
    title: "Get Your Style Guide",
    desc: "Our AI stylist generates your perfect color palette, outfit recommendations, accessories, and hairstyle tips.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: ShoppingBag,
    num: "04",
    title: "Shop the Look",
    desc: "Browse curated shopping links for every recommended item. One click to find your perfect wardrobe.",
    color: "from-cyan-500 to-teal-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            From Selfie to <span className="gradient-text">Style Guide</span>
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-center">
            Four simple steps. No accounts, no uploads, no waiting.
          </p>
        </motion.div>

        {/* Steps — 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 sm:p-7 text-center hover:bg-white/[0.04] transition-all"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mx-auto mb-4`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>

              <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                Step {s.num}
              </span>
              <h3 className="text-lg font-display font-semibold text-white mt-1 mb-2">
                {s.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
