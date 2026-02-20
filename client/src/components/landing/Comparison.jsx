import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const rows = [
  { feature: "Personalized to Skin Tone", trad: true, generic: false, styllo: true },
  { feature: "Color Science (LAB Space)", trad: false, generic: false, styllo: true },
  { feature: "AI-Powered Recommendations", trad: false, generic: "partial", styllo: true },
  { feature: "100% Privacy (No Uploads)", trad: "na", generic: false, styllo: true },
  { feature: "Instant Results", trad: false, generic: true, styllo: true },
  { feature: "Direct Shopping Links", trad: false, generic: false, styllo: true },
  { feature: "Free to Use", trad: false, generic: "partial", styllo: true },
  { feature: "Explainable Reasoning", trad: true, generic: false, styllo: true },
];

function Cell({ value }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-red-400/60 mx-auto" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-amber-400 mx-auto" />;
  return <Minus className="w-4 h-4 text-zinc-600 mx-auto" />;
}

export default function Comparison() {
  return (
    <section id="compare" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">
            Compare
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Why <span className="gradient-text">Styllo</span> Stands Out
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-center">
            See how we compare to traditional stylists and generic fashion apps.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full rounded-2xl glass overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-4 px-6 text-zinc-400 font-medium">Feature</th>
                  <th className="py-4 px-4 text-zinc-400 font-medium text-center whitespace-nowrap">Traditional</th>
                  <th className="py-4 px-4 text-zinc-400 font-medium text-center whitespace-nowrap">Generic Apps</th>
                  <th className="py-4 px-6 text-center">
                    <span className="gradient-text font-bold">Styllo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.feature}
                    className={`border-b border-white/[0.03] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                  >
                    <td className="py-3.5 px-6 text-zinc-300 text-sm">{r.feature}</td>
                    <td className="py-3.5 px-4 text-center"><Cell value={r.trad} /></td>
                    <td className="py-3.5 px-4 text-center"><Cell value={r.generic} /></td>
                    <td className="py-3.5 px-6 text-center"><Cell value={r.styllo} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
