import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowLeft, Camera, Upload, MessageSquare, ClipboardList, Search, Radar } from "lucide-react";

// Landing page
import Navbar from "./components/landing/Navbar";
import HeroSection from "./components/landing/HeroSection";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import Comparison from "./components/landing/Comparison";
import Footer from "./components/landing/Footer";

// Analyzer flow
import ImageUpload from "./components/ImageUpload";
import LiveCapture from "./components/LiveCapture";
import TextPrompt from "./components/TextPrompt";
import StyleForm from "./components/StyleForm";
import GenderSelect from "./components/GenderSelect";
import AnalysisView from "./components/AnalysisView";
import ResultsView from "./components/ResultsView";

// New features
import DecodeOutfit from "./components/DecodeOutfit";
import TrendRadar from "./components/TrendRadar";

// API
import { getRecommendationsFromText, getRecommendationsFromForm } from "./services/api";

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.3 } },
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/analyze/*" element={<AnalyzerFlow />} />
    </Routes>
  );
}

/* ─── Landing Page ─── */
function LandingPage() {
  const navigate = useNavigate();
  const goToAnalyzer = () => navigate("/analyze");

  return (
    <div className="min-h-screen w-full bg-surface-950">
      <Navbar onGetStarted={goToAnalyzer} />
      <HeroSection onGetStarted={goToAnalyzer} />
      <Features />
      <HowItWorks />
      <Comparison />
      <Footer onGetStarted={goToAnalyzer} />
    </div>
  );
}

/* ─── Analyzer Flow with proper sub-routes ─── */
function AnalyzerFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gender, setGender] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const goHome = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setGender(null);
    setAnalysisResult(null);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const goToChoose = useCallback(() => {
    navigate("/analyze");
  }, [navigate]);

  // Photo paths
  const handleImageSelect = useCallback((file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    navigate("/analyze/gender");
  }, [navigate]);

  const handleLiveCapture = useCallback((file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
    navigate("/analyze/gender");
  }, [navigate]);

  const handleGenderSelect = useCallback((g) => {
    setGender(g);
    navigate("/analyze/analyzing");
  }, [navigate]);

  const handleAnalysisComplete = useCallback((result) => {
    setAnalysisResult(result);
    navigate("/analyze/results");
  }, [navigate]);

  // Text prompt
  const handleTextSubmit = useCallback(async (text) => {
    const apiResult = await getRecommendationsFromText(text);
    setAnalysisResult({ skinTone: "Self-described", confidence: 1, ...apiResult });
    navigate("/analyze/results");
  }, [navigate]);

  // Form submit
  const handleFormSubmit = useCallback(async (formData) => {
    const apiResult = await getRecommendationsFromForm(formData);
    setAnalysisResult({ skinTone: formData.skinTone, confidence: 1, ...apiResult });
    setGender(formData.gender);
    navigate("/analyze/results");
  }, [navigate]);

  const handleRestart = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setGender(null);
    setAnalysisResult(null);
    navigate("/analyze");
  }, [navigate]);

  // Determine layout width from current route
  const subPath = location.pathname.replace("/analyze", "").replace(/^\//, "");
  const isWide = subPath === "results";
  const isForm = subPath === "form";
  const isFeature = subPath === "decode" || subPath === "trends";

  return (
    <div className="min-h-screen w-full bg-surface-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-accent-500/8 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/5">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <button onClick={goHome} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="font-display font-bold text-sm gradient-text">Styllo</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main className={`relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 ${
        isWide ? "max-w-6xl" : isForm ? "max-w-2xl" : isFeature ? "max-w-5xl" : "max-w-3xl"
      }`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route index element={
              <motion.div {...pageVariants}>
                <ChooseMode
                  onCamera={() => navigate("/analyze/live")}
                  onUpload={() => navigate("/analyze/upload")}
                  onText={() => navigate("/analyze/text")}
                  onForm={() => navigate("/analyze/form")}
                  onDecode={() => navigate("/analyze/decode")}
                  onTrends={() => navigate("/analyze/trends")}
                />
              </motion.div>
            } />

            <Route path="upload" element={
              <motion.div {...pageVariants}>
                <ImageUpload onImageSelect={handleImageSelect} onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="live" element={
              <motion.div {...pageVariants}>
                <LiveCapture onCapture={handleLiveCapture} onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="text" element={
              <motion.div {...pageVariants}>
                <TextPrompt onSubmit={handleTextSubmit} onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="form" element={
              <motion.div {...pageVariants}>
                <StyleForm onSubmit={handleFormSubmit} onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="decode" element={
              <motion.div {...pageVariants}>
                <DecodeOutfit onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="trends" element={
              <motion.div {...pageVariants}>
                <TrendRadar onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="gender" element={
              <motion.div {...pageVariants}>
                <GenderSelect imagePreview={imagePreview} onSelect={handleGenderSelect} onBack={goToChoose} />
              </motion.div>
            } />

            <Route path="analyzing" element={
              <motion.div {...pageVariants}>
                <AnalysisView imageFile={imageFile} gender={gender} onComplete={handleAnalysisComplete} onError={handleRestart} />
              </motion.div>
            } />

            <Route path="results" element={
              <motion.div {...pageVariants}>
                <ResultsView data={analysisResult} gender={gender} onRestart={handleRestart} />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── Choose Mode Component — 6 options, full-width responsive grid ── */

const modes = [
  {
    key: "camera",
    icon: Camera,
    label: "Live Camera",
    desc: "Real-time face detection with AI overlay",
    gradient: "from-primary-600 to-rose-500",
    shadow: "shadow-primary-500/20",
    badge: "NEW",
    onClickKey: "onCamera",
  },
  {
    key: "upload",
    icon: Upload,
    label: "Upload Photo",
    desc: "Upload an existing selfie from your device",
    gradient: "from-zinc-600 to-zinc-700",
    shadow: "",
    onClickKey: "onUpload",
  },
  {
    key: "text",
    icon: MessageSquare,
    label: "Text Prompt",
    desc: "Describe yourself in words — no photo needed",
    gradient: "from-cyan-600 to-blue-600",
    shadow: "shadow-cyan-500/20",
    badge: "NO PHOTO",
    onClickKey: "onText",
  },
  {
    key: "form",
    icon: ClipboardList,
    label: "Style Form",
    desc: "Fill out a quick form for tailored suggestions",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
    badge: "NO PHOTO",
    onClickKey: "onForm",
  },
  {
    key: "decode",
    icon: Search,
    label: "Decode Outfit",
    desc: "Describe or upload any outfit → AI adapts it for you",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    badge: "HOT",
    onClickKey: "onDecode",
  },
  {
    key: "trends",
    icon: Radar,
    label: "Trend Radar",
    desc: "See what's trending this season for your style",
    gradient: "from-violet-500 to-purple-700",
    shadow: "shadow-violet-500/20",
    badge: "LIVE",
    onClickKey: "onTrends",
  },
];

function ChooseMode({ onCamera, onUpload, onText, onForm, onDecode, onTrends }) {
  const handlers = { onCamera, onUpload, onText, onForm, onDecode, onTrends };

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Let&apos;s Analyze Your <span className="gradient-text">Style</span>
        </h2>
        <p className="text-zinc-400 text-sm">Choose how you&apos;d like to get started</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((m) => (
          <motion.button
            key={m.key}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlers[m.onClickKey]}
            className="cursor-pointer group relative flex flex-col items-center gap-4 p-7 rounded-2xl glass hover:bg-white/4 transition-all border border-transparent hover:border-primary-500/20"
          >
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${m.gradient} flex items-center justify-center shadow-lg ${m.shadow}`}>
              <m.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-white text-lg mb-1">{m.label}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{m.desc}</p>
            </div>
            {m.badge && (
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-300 text-[10px] font-bold tracking-wider">
                {m.badge}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <p className="text-zinc-600 text-xs text-center mt-2">
        🔒 Your photo never leaves your device — all processing happens in the browser
      </p>
    </div>
  );
}
