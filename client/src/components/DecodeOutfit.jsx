import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Loader2, Sparkles, ShoppingBag, ChevronDown, ChevronUp, Image as ImageIcon, Type, Upload, X, ExternalLink } from "lucide-react";
import { decodeOutfit, decodeOutfitImage } from "../services/api";
import { generateAffiliateLinkFromQuery } from "../utils/affiliateLinks";

const EXAMPLES = [
  "Oversized camel blazer, white tee, straight-leg blue jeans, white sneakers",
  "Black leather jacket, grey hoodie, dark slim jeans, Chelsea boots",
  "Lavender linen co-ord set with gold sandals and straw tote bag",
  "Navy suit, light pink shirt, brown oxford shoes, pocket square",
];

export default function DecodeOutfit({ onBack }) {
  const [mode, setMode] = useState("text"); // "text" | "image"
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ skinTone: "", gender: "", budget: "Mid-Range" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    setError("");

    if (mode === "text" && (!description.trim() || description.trim().length < 15)) {
      setError("Please describe the outfit in at least 15 characters.");
      return;
    }
    if (mode === "image" && !imageFile) {
      setError("Please upload an outfit image.");
      return;
    }

    const userProfile = (profile.skinTone || profile.gender) ? profile : null;
    setLoading(true);

    try {
      let res;
      if (mode === "image" && imageFile) {
        // Convert file to base64
        const base64 = await fileToBase64(imageFile);
        res = await decodeOutfitImage(base64, imageFile.type, userProfile);
      } else {
        res = await decodeOutfit(description.trim(), userProfile);
      }
      setResult(res.decoded);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Reset to input screen
  const handleReset = () => {
    setResult(null);
    setDescription("");
    removeImage();
    setError("");
  };

  // ── Results View ──
  if (result) {
    return (
      <div className="w-full flex flex-col gap-6 pt-4">
        <button onClick={handleReset} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors self-start">
          <ArrowLeft className="w-4 h-4" /> Decode another outfit
        </button>

        {/* Adapted Outfit Summary */}
        {result.adaptedOutfit?.summary && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl glass border border-primary-500/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h3 className="font-display font-bold text-white">Your Adapted Look</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.adaptedOutfit.summary}</p>
          </motion.div>
        )}

        {/* Original Breakdown */}
        {result.originalBreakdown?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Original Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.originalBreakdown.map((item, i) => (
                <div key={i} className="p-4 rounded-xl glass">
                  <p className="text-sm font-bold text-white">{item.piece}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                    <span>Color: <strong className="text-zinc-200">{item.color}</strong></span>
                    <span>•</span>
                    <span>{item.fabric}</span>
                  </div>
                  <span className="text-[10px] text-primary-400/60 mt-1 block">{item.role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Adapted Pieces with shopping */}
        {result.adaptedOutfit?.pieces?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Adapted for You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.adaptedOutfit.pieces.map((p, i) => (
                <div key={i} className="p-5 rounded-xl glass">
                  <p className="font-bold text-white mb-2">{p.piece}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: p.adaptedHex || "#888" }} />
                      <span className="text-xs text-zinc-300">{p.adaptedColor}</span>
                    </div>
                    <span className="text-zinc-600">←</span>
                    <span className="text-xs text-zinc-500">{p.originalColor}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">Fabric: {p.fabric}</p>
                  {p.searchQuery && (
                    <a
                      href={generateAffiliateLinkFromQuery(p.searchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" /> Shop on Amazon <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Styling Tips */}
        {result.stylingTips?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Styling Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.stylingTips.map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl glass">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-300">{i + 1}</div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Why It Works */}
        {result.whyItWorks && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
            className="p-5 rounded-xl glass border border-emerald-500/10"
          >
            <h3 className="text-sm font-bold text-emerald-400 mb-2">Why This Works for You</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.whyItWorks}</p>
          </motion.div>
        )}
      </div>
    );
  }

  // ── Input View ──
  return (
    <div className="w-full flex flex-col gap-5 pt-6">
      <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-2">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Search className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">Decode Any Outfit</h2>
        <p className="text-sm text-zinc-400">Describe or upload any outfit — AI breaks it down and adapts it for you</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl bg-surface-900 border border-white/5 p-1 gap-1">
        <button onClick={() => setMode("text")}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === "text" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Type className="w-4 h-4" /> Describe It
        </button>
        <button onClick={() => setMode("image")}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === "image" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-zinc-400 hover:text-white"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Upload Photo
        </button>
      </div>

      {/* Text Input */}
      <AnimatePresence mode="wait">
        {mode === "text" ? (
          <motion.div key="text-input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 'Black leather jacket over a white graphic tee, dark slim jeans, and white chunky sneakers...'"
              rows={4}
              className="w-full rounded-xl glass border border-white/5 bg-transparent text-zinc-200 text-sm p-4 resize-none focus:outline-none focus:border-primary-500/30 placeholder-zinc-600 transition-colors"
            />

            {/* Quick Examples */}
            <div className="mt-3">
              <p className="text-xs text-zinc-600 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setDescription(ex)}
                    className="cursor-pointer text-xs px-3 py-1.5 rounded-lg glass text-zinc-400 hover:text-white hover:bg-white/2 transition-colors border border-transparent hover:border-white/10"
                  >
                    {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="image-input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-white/5 bg-surface-900">
                <img src={imagePreview} alt="Outfit" className="w-full max-h-72 object-contain" />
                <button onClick={removeImage}
                  className="cursor-pointer absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="cursor-pointer w-full p-10 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-500/30 transition-colors flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-400">Click to upload outfit photo</p>
                <p className="text-xs text-zinc-600">PNG, JPG · Max 4MB</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Toggle */}
      <button onClick={() => setShowProfile(!showProfile)}
        className="cursor-pointer flex items-center justify-between text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-1"
      >
        <span>Personalize results (optional)</span>
        {showProfile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {showProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-3 gap-3 overflow-hidden"
          >
            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">Skin Tone</label>
              <select value={profile.skinTone} onChange={(e) => setProfile({ ...profile, skinTone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg glass border border-white/5 bg-transparent text-zinc-300 focus:outline-none"
              >
                <option value="">Any</option>
                <option>Fair</option><option>Light</option><option>Medium</option><option>Olive</option><option>Deep</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">Gender</label>
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg glass border border-white/5 bg-transparent text-zinc-300 focus:outline-none"
              >
                <option value="">Any</option>
                <option>Male</option><option>Female</option><option>Non-binary</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">Budget</label>
              <select value={profile.budget} onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg glass border border-white/5 bg-transparent text-zinc-300 focus:outline-none"
              >
                <option>Budget</option><option>Mid-Range</option><option>Premium</option><option>Luxury</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="cursor-pointer w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === "image" ? "Analyzing image with AI Vision..." : "Decoding outfit..."}
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Decode This Outfit
          </>
        )}
      </motion.button>
    </div>
  );
}

/** Convert File to base64 string */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // strip data:...;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
