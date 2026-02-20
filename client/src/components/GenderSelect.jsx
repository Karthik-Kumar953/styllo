import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const options = [
  { value: "Male", emoji: "👔", label: "Male", desc: "Suits, shirts, casual wear" },
  { value: "Female", emoji: "👗", label: "Female", desc: "Dresses, tops, accessories" },
];

export default function GenderSelect({ imagePreview, onSelect, onBack }) {
  return (
    <div className="w-full flex flex-col items-center gap-6 pt-6">
      <button onClick={onBack} className="cursor-pointer self-start flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {imagePreview && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500/40 shadow-lg shadow-primary-500/20"
        >
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        </motion.div>
      )}

      <div className="w-full text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
          Select Your <span className="gradient-text">Style</span>
        </h2>
        <p className="text-zinc-400 text-sm">This personalizes your recommendations.</p>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.15 } }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(opt.value)}
            className="flex-1 flex flex-col items-center gap-3 py-10 rounded-2xl glass hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <span className="text-5xl">{opt.emoji}</span>
            <span className="text-white font-semibold text-lg">{opt.label}</span>
            <span className="text-zinc-500 text-xs">{opt.desc}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
