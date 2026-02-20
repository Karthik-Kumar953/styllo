import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardList, ArrowLeft, Loader2, Send, 
  User, Users, CalendarClock, Palette, 
  ThermometerSun, ThermometerSnowflake, CircleDot,
  Shirt, PartyPopper, Briefcase, Heart, Plane,
  Wallet, Banknote, Crown, Sparkles, Check
} from "lucide-react";

const SKIN_TONES = [
  { label: "Fair", color: "#FDDCB5" },
  { label: "Light", color: "#E8C9A0" },
  { label: "Medium", color: "#D4A574" },
  { label: "Olive", color: "#A67C52" },
  { label: "Deep", color: "#8B5E3C" },
  { label: "Dark", color: "#6B4226" },
];

const UNDERTONES = [
  { label: "Warm", icon: ThermometerSun, color: "text-amber-400" },
  { label: "Cool", icon: ThermometerSnowflake, color: "text-blue-400" },
  { label: "Neutral", icon: CircleDot, color: "text-zinc-400" },
];

const GENDERS = [
  { label: "Male", icon: User, color: "text-blue-400" },
  { label: "Female", icon: User, color: "text-rose-400" },
  { label: "Non-binary", icon: Users, color: "text-purple-400" },
];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];

const OCCASIONS = [
  { label: "Everyday Casual", icon: Shirt },
  { label: "Work / Office", icon: Briefcase },
  { label: "Date Night", icon: Heart },
  { label: "Wedding / Event", icon: PartyPopper },
  { label: "Vacation", icon: Plane },
];

const BUDGETS = [
  { label: "Budget-Friendly", icon: Wallet, hint: "Under ₹2K" },
  { label: "Mid-Range", icon: Banknote, hint: "₹2K–₹8K" },
  { label: "Premium / Designer", icon: Crown, hint: "₹8K+" },
];

const STYLES = [
  "Casual", "Formal", "Streetwear", "Minimalist", 
  "Ethnic / Traditional", "Sporty", "Bohemian", "Vintage"
];

export default function StyleForm({ onSubmit, onBack }) {
  const [form, setForm] = useState({
    gender: "",
    ageRange: "",
    skinTone: "",
    undertone: "",
    stylePreferences: [],
    occasion: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const toggleStyle = (style) => {
    setForm((f) => ({
      ...f,
      stylePreferences: f.stylePreferences.includes(style)
        ? f.stylePreferences.filter((s) => s !== style)
        : [...f.stylePreferences, style],
    }));
  };

  const isValid = form.gender && form.ageRange && form.skinTone && form.undertone && form.occasion && form.budget;

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-2 pb-8">
      <div className="w-full text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-1">
          Your <span className="gradient-text">Style Profile</span>
        </h2>
        <p className="text-zinc-500 text-xs">
          Personalized advice based on your details
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-5">

        {/* Gender & Age Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Gender" icon={User}>
            <div className="flex bg-surface-900/50 p-1 rounded-xl border border-white/5">
              {GENDERS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => update("gender", g.label)}
                  className={`cursor-pointer flex-1 py-2 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-1 ${
                    form.gender === g.label
                      ? "bg-surface-700 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <g.icon className={`w-3.5 h-3.5 ${form.gender === g.label ? g.color : ""}`} />
                  {g.label}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Age Range" icon={CalendarClock}>
            <select
              value={form.ageRange}
              onChange={(e) => update("ageRange", e.target.value)}
              className="cursor-pointer w-full px-3 py-2.5 rounded-xl bg-surface-900/50 border border-white/5 text-white text-xs focus:outline-none focus:border-primary-500/30 transition-all appearance-none"
            >
              <option value="" disabled className="text-zinc-500">Select Age</option>
              {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </FieldGroup>
        </div>

        {/* Skin Tone & Undertone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Skin Tone" icon={Palette}>
            <div className="grid grid-cols-6 gap-1.5 p-1 bg-surface-900/50 rounded-xl border border-white/5">
              {SKIN_TONES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => update("skinTone", t.label)}
                  title={t.label}
                  className={`cursor-pointer aspect-square rounded-lg transition-all border-2 ${
                    form.skinTone === t.label ? "border-primary-500 scale-110 shadow-lg" : "border-transparent"
                  }`}
                  style={{ backgroundColor: t.color }}
                />
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Undertone" icon={Sparkles}>
            <div className="flex bg-surface-900/50 p-1 rounded-xl border border-white/5">
              {UNDERTONES.map((u) => (
                <button
                  key={u.label}
                  onClick={() => update("undertone", u.label)}
                  className={`cursor-pointer flex-1 py-2 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-1 ${
                    form.undertone === u.label
                      ? "bg-surface-700 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <u.icon className={`w-3.5 h-3.5 ${form.undertone === u.label ? u.color : ""}`} />
                  {u.label}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        {/* Style Preferences */}
        <FieldGroup label="Style Preferences" icon={Shirt}>
          <div className="flex flex-wrap gap-1.5 p-2 bg-surface-900/50 rounded-xl border border-white/5">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  form.stylePreferences.includes(s)
                    ? "bg-primary-600/20 text-primary-300 border border-primary-500/30"
                    : "bg-surface-800 text-zinc-500 border border-transparent hover:border-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Occasion & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Occasion" icon={PartyPopper}>
            <select
              value={form.occasion}
              onChange={(e) => update("occasion", e.target.value)}
              className="cursor-pointer w-full px-3 py-2.5 rounded-xl bg-surface-900/50 border border-white/5 text-white text-xs focus:outline-none focus:border-primary-500/30 transition-all appearance-none"
            >
              <option value="" disabled>Where are you going?</option>
              {OCCASIONS.map((o) => <option key={o.label} value={o.label}>{o.label}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label="Budget" icon={Wallet}>
            <div className="flex bg-surface-900/50 p-1 rounded-xl border border-white/5">
              {BUDGETS.map((b) => (
                <button
                  key={b.label}
                  onClick={() => update("budget", b.label)}
                  title={b.hint}
                  className={`cursor-pointer flex-1 py-1.5 rounded-lg transition-all flex justify-center ${
                    form.budget === b.label
                      ? "bg-surface-700 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <b.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: isValid && !loading ? 1.02 : 1 }}
            whileTap={{ scale: isValid && !loading ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className={`cursor-pointer w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xl ${
              !loading && isValid
                ? "bg-gradient-to-r from-primary-600 to-rose-600 text-white shadow-primary-500/20"
                : "bg-surface-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Send className="w-4 h-4" /> Get Recommendations</>
            )}
          </motion.button>

          <button onClick={onBack} className="cursor-pointer mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to options
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-[10px] text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 pl-1">
        <Icon className="w-3 h-3 text-zinc-500" />
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</label>
      </div>
      {children}
    </div>
  );
}
