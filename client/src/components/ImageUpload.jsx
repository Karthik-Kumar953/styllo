import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, ImagePlus, AlertCircle, Shield, ArrowLeft } from "lucide-react";

const MAX_SIZE_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ onImageSelect, onBack }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) return "Please upload a JPG, PNG, or WebP image.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Image must be under ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = useCallback(
    (file) => {
      const err = validate(file);
      if (err) { setError(err); return; }
      setError(null);
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Upload Your <span className="gradient-text">Photo</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto">
          A clear, well-lit selfie works best for accurate skin tone analysis.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`cursor-pointer w-full max-w-md aspect-[4/5] rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4
          ${dragActive
            ? "border-2 border-primary-400 bg-primary-500/10 shadow-xl shadow-primary-500/10"
            : "glass hover:bg-white/[0.04] glow-purple"
          }`}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600/30 to-rose-500/20 flex items-center justify-center"
        >
          <ImagePlus className="w-8 h-8 text-primary-300" />
        </motion.div>

        <div className="text-center px-4">
          <p className="text-zinc-200 font-medium">Drag & drop your photo here</p>
          <p className="text-zinc-500 text-xs mt-1">JPG, PNG, or WebP • max {MAX_SIZE_MB}MB</p>
        </div>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-md">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => inputRef.current?.click()}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow"
        >
          <Upload className="w-4 h-4" /> Choose File
        </motion.button>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { inputRef.current.setAttribute("capture", "user"); inputRef.current?.click(); setTimeout(() => inputRef.current?.removeAttribute("capture"), 100); }}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl glass hover:bg-white/[0.04] text-zinc-300 font-medium text-sm transition-colors"
        >
          <Camera className="w-4 h-4" /> Camera
        </motion.button>
      </div>

      {onBack && (
        <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to options
        </button>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20"
        >
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </motion.div>
      )}

      <p className="flex items-center gap-1.5 text-zinc-600 text-xs text-center">
        <Shield className="w-3.5 h-3.5 text-emerald-500" /> Processed entirely in your browser. Never uploaded.
      </p>
    </div>
  );
}
