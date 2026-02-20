import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useSkinToneDetection } from "../hooks/useSkinToneDetection";
import { getRecommendations } from "../services/api";

const STAGES = [
  { msg: "Initializing AI engine...", icon: "🧠" },
  { msg: "Detecting face...", icon: "📸" },
  { msg: "Sampling skin pixels...", icon: "🔬" },
  { msg: "Analyzing color space...", icon: "🎨" },
  { msg: "Generating your style guide...", icon: "✨" },
];

export default function AnalysisView({ imageFile, gender, onComplete, onError }) {
  const { analyze, stage, error: detectionError } = useSkinToneDetection();
  const [currentStage, setCurrentStage] = useState(0);
  const [apiError, setApiError] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const ticker = setInterval(() => setCurrentStage((s) => Math.min(s + 1, STAGES.length - 1)), 2000);

        const result = await analyze(imageFile);
        setCurrentStage(STAGES.length - 1);

        const apiResult = await getRecommendations(result.skinTone, result.confidence, gender);
        clearInterval(ticker);
        onComplete({ ...result, ...apiResult });
      } catch (err) {
        console.error("Analysis failed:", err);
        setApiError(detectionError || err.message || "Something went wrong.");
      }
    })();
  }, []);

  const hasError = detectionError || apiError;

  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-20 min-h-[70vh]">
      {hasError ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 text-center px-6 py-10 rounded-2xl glass max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-red-300 text-sm">{hasError}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onError}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-rose-500 text-white text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </motion.button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8">
          {/* Animated spinner */}
          <div className="relative w-28 h-28">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-400 border-r-rose-400"
            />
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-transparent border-b-accent-400/50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">{STAGES[currentStage].icon}</span>
            </div>
          </div>

          {/* Stage text */}
          <div className="text-center">
            <motion.p key={currentStage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-white font-medium text-sm"
            >
              {stage || STAGES[currentStage].msg}
            </motion.p>
            <p className="text-zinc-500 text-xs mt-2">This takes a few seconds...</p>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 rounded-full bg-surface-700 overflow-hidden">
            <motion.div
              animate={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-rose-500"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
