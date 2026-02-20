import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { generateShoppingLinks } from "../utils/affiliateLinks";

export default function ShoppingLinks({ skinTone, gender, outfitSuggestions }) {
  const outfitsWithLinks = generateShoppingLinks(skinTone, gender, outfitSuggestions);

  if (outfitsWithLinks.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className="w-5 h-5 text-primary-400" />
        <h3 className="font-display font-semibold text-white">Shop the Look</h3>
      </div>

      <div className="flex flex-col gap-3">
        {outfitsWithLinks.map((outfit, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-800/60 border border-zinc-800/50">
            <h4 className="text-sm font-medium text-white mb-2">{outfit.name}</h4>
            <div className="flex flex-wrap gap-2">
              {outfit.links.map((link, j) => (
                <motion.a
                  key={j}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600/30 to-accent-500/20 border border-primary-500/30 text-primary-200 text-xs hover:border-primary-400/50 transition-colors"
                >
                  {link.item} <ExternalLink className="w-3 h-3" />
                </motion.a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
