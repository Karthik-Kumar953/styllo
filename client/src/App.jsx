import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowLeft, Camera, Upload, MessageSquare, ClipboardList } from "lucide-react";

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

// API
import { getRecommendationsFromText, getRecommendationsFromForm } from "./services/api";

const STEPS = {
  CHOOSE: "choose",
  UPLOAD: "upload",
  LIVE: "live",
  TEXT: "text",
  FORM: "form",
  GENDER: "gender",
  ANALYZING: "analyzing",
  RESULTS: "results",
};

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.3 } },
};

export default function App() {
  const [view, setView] = useState("landing");
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gender, setGender] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const goToAnalyzer = useCallback(() => {
    setView("analyzer");
    setStep(STEPS.CHOOSE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToLanding = useCallback(() => {
    setView("landing");
    setImageFile(null);
    setImagePreview(null);
    setGender(null);
    setAnalysisResult(null);
    setStep(STEPS.CHOOSE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Photo paths → gender → analyze
  const handleImageSelect = useCallback((file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep(STEPS.GENDER);
  }, []);

  const handleLiveCapture = useCallback((file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
    setStep(STEPS.GENDER);
  }, []);

  const handleGenderSelect = useCallback((g) => {
    setGender(g);
    setStep(STEPS.ANALYZING);
  }, []);

  const handleAnalysisComplete = useCallback((result) => {
    setAnalysisResult(result);
    setStep(STEPS.RESULTS);
  }, []);

  // Text prompt → skip gender/analysis, call API directly
  const handleTextSubmit = useCallback(async (text) => {
    const apiResult = await getRecommendationsFromText(text);
    setAnalysisResult({
      skinTone: "Self-described",
      confidence: 1,
      ...apiResult,
    });
    setStep(STEPS.RESULTS);
  }, []);

  // Form → skip gender/analysis, call API directly
  const handleFormSubmit = useCallback(async (formData) => {
    const apiResult = await getRecommendationsFromForm(formData);
    setAnalysisResult({
      skinTone: formData.skinTone,
      confidence: 1,
      ...apiResult,
    });
    setGender(formData.gender);
    setStep(STEPS.RESULTS);
  }, []);

  const handleRestart = useCallback(() => {
    setStep(STEPS.CHOOSE);
    setImageFile(null);
    setImagePreview(null);
    setGender(null);
    setAnalysisResult(null);
  }, []);

  // ─── Landing Page ───
  if (view === "landing") {
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

  // ─── Analyzer Flow ───
  const isWide = step === STEPS.RESULTS;
  const isForm = step === STEPS.FORM;

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
          <button onClick={goToLanding} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="font-display font-bold text-sm gradient-text">Styllo</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Step content */}
      <main className={`relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 ${
        isWide ? "max-w-6xl" : isForm ? "max-w-xl" : "max-w-lg"
      }`}>
        <AnimatePresence mode="wait">

          {step === STEPS.CHOOSE && (
            <motion.div key="choose" {...pageVariants}>
              <ChooseMode
                onCamera={() => setStep(STEPS.LIVE)}
                onUpload={() => setStep(STEPS.UPLOAD)}
                onText={() => setStep(STEPS.TEXT)}
                onForm={() => setStep(STEPS.FORM)}
              />
            </motion.div>
          )}

          {step === STEPS.UPLOAD && (
            <motion.div key="upload" {...pageVariants}>
              <ImageUpload onImageSelect={handleImageSelect} onBack={() => setStep(STEPS.CHOOSE)} />
            </motion.div>
          )}

          {step === STEPS.LIVE && (
            <motion.div key="live" {...pageVariants}>
              <LiveCapture onCapture={handleLiveCapture} onBack={() => setStep(STEPS.CHOOSE)} />
            </motion.div>
          )}

          {step === STEPS.TEXT && (
            <motion.div key="text" {...pageVariants}>
              <TextPrompt onSubmit={handleTextSubmit} onBack={() => setStep(STEPS.CHOOSE)} />
            </motion.div>
          )}

          {step === STEPS.FORM && (
            <motion.div key="form" {...pageVariants}>
              <StyleForm onSubmit={handleFormSubmit} onBack={() => setStep(STEPS.CHOOSE)} />
            </motion.div>
          )}

          {step === STEPS.GENDER && (
            <motion.div key="gender" {...pageVariants}>
              <GenderSelect imagePreview={imagePreview} onSelect={handleGenderSelect} onBack={() => setStep(STEPS.CHOOSE)} />
            </motion.div>
          )}

          {step === STEPS.ANALYZING && (
            <motion.div key="analyzing" {...pageVariants}>
              <AnalysisView imageFile={imageFile} gender={gender} onComplete={handleAnalysisComplete} onError={handleRestart} />
            </motion.div>
          )}

          {step === STEPS.RESULTS && (
            <motion.div key="results" {...pageVariants}>
              <ResultsView data={analysisResult} gender={gender} onRestart={handleRestart} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Choose Mode Component — 4 options ──

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
];

function ChooseMode({ onCamera, onUpload, onText, onForm }) {
  const handlers = { onCamera, onUpload, onText, onForm };

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Let's Analyze Your <span className="gradient-text">Style</span>
        </h2>
        <p className="text-zinc-400 text-sm">Choose how you'd like to get started</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modes.map((m) => (
          <motion.button
            key={m.key}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlers[m.onClickKey]}
            className={`cursor-pointer group relative flex flex-col items-center gap-4 p-7 rounded-2xl glass hover:bg-white/[0.04] transition-all border border-transparent hover:border-primary-500/20`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg ${m.shadow}`}>
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
