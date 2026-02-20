import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Calendar, Palette, Sparkles, Shirt, 
  ShoppingBag, Target, Info, ArrowLeft, Send, 
  Loader2, Check, ChevronDown, HelpCircle,
  ThermometerSun, ThermometerSnowflake, CircleDot,
  Wallet, Banknote, Crown, PartyPopper, Briefcase, Heart, Plane
} from "lucide-react";

/** 
 * PROFESSIONAL GENERIC FORM DESIGN
 * Focus: Standard inputs, clean hierarchy, professional typography.
 */

const GENDERS = ["Male", "Female", "Non-binary"];
const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
const SKIN_TONES = [
  { id: "Fair", color: "#FDDCB5" },
  { id: "Light", color: "#E8C9A0" },
  { id: "Medium", color: "#D4A574" },
  { id: "Olive", color: "#A67C52" },
  { id: "Deep", color: "#8B5E3C" },
  { id: "Dark", color: "#6B4226" },
];
const UNDERTONES = [
  { id: "Warm", label: "Warm", icon: ThermometerSun },
  { id: "Cool", label: "Cool", icon: ThermometerSnowflake },
  { id: "Neutral", label: "Neutral", icon: CircleDot },
];
const OCCASIONS = [
  "Everyday Casual", "Work / Office", "Date Night", 
  "Wedding / Event", "Vacation", "Club / Party"
];
const BUDGETS = [
  { id: "Budget-Friendly", label: "Budget-Friendly", icon: Wallet, hint: "Under ₹2k" },
  { id: "Mid-Range", label: "Mid-Range", icon: Banknote, hint: "₹2k-₹8k" },
  { id: "Premium", label: "Premium", icon: Crown, hint: "₹8k+" },
];
const STYLES = ["Casual", "Formal", "Streetwear", "Minimalist", "Ethnic", "Sporty", "Vintage"];

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
  const [error, setError] = useState("");

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (error) setError("");
  };

  const toggleStyle = (style) => {
    setForm(f => ({
      ...f,
      stylePreferences: f.stylePreferences.includes(style)
        ? f.stylePreferences.filter(s => s !== style)
        : [...f.stylePreferences, style]
    }));
  };

  const isValid = form.gender && form.ageRange && form.skinTone && form.undertone && form.occasion && form.budget;

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8 pt-4 pb-12">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          Style <span className="gradient-text">Profile</span>
        </h2>
        <p className="text-zinc-500 text-xs font-medium">Complete the form below for AI recommendations</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 1. Basic Info */}
        <FormCard title="Basic Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormGroup label="Gender" icon={User}>
              <select 
                value={form.gender} 
                onChange={e => update("gender", e.target.value)}
                className="cursor-pointer generic-input"
              >
                <option value="" disabled>Select Gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Age Range" icon={Calendar}>
              <select 
                value={form.ageRange} 
                onChange={e => update("ageRange", e.target.value)}
                className="cursor-pointer generic-input"
              >
                <option value="" disabled>Select Age</option>
                {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormGroup>
          </div>
        </FormCard>

        {/* 2. Appearance */}
        <FormCard title="Appearance Details" icon={Palette}>
          <div className="space-y-6">
            <FormGroup label="Skin Tone" description="Choose the closest match to your skin tone" icon={Sparkles}>
              <div className="flex flex-wrap gap-2.5">
                {SKIN_TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => update("skinTone", t.id)}
                    className={`cursor-pointer w-10 h-10 rounded-lg transition-all border-2 relative flex items-center justify-center ${
                      form.skinTone === t.id ? "border-primary-500 scale-110 shadow-md ring-1 ring-primary-500/20" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: t.color }}
                  >
                    {form.skinTone === t.id && <Check className="w-5 h-5 text-white/90 drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </FormGroup>

            <FormGroup label="Undertone" icon={Target}>
              <div className="grid grid-cols-3 gap-2">
                {UNDERTONES.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => update("undertone", u.id)}
                    className={`cursor-pointer flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-wider ${
                      form.undertone === u.id 
                        ? "bg-primary-600/10 border-primary-500/50 text-primary-300"
                        : "bg-surface-900/50 border-white/5 text-zinc-500 hover:border-white/10"
                    }`}
                  >
                    <u.icon className="w-4 h-4" />
                    {u.label}
                  </button>
                ))}
              </div>
            </FormGroup>
          </div>
        </FormCard>

        {/* 3. Style Context */}
        <FormCard title="Occasion & Style" icon={Shirt}>
          <div className="space-y-6">
            <FormGroup label="Primary Occasion" icon={Target}>
              <select 
                value={form.occasion} 
                onChange={e => update("occasion", e.target.value)}
                className="cursor-pointer generic-input"
              >
                <option value="" disabled>Where will you be wearing this?</option>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Budget Preference" icon={ShoppingBag}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => update("budget", b.id)}
                    className={`cursor-pointer flex items-center justify-between sm:justify-center sm:flex-col gap-2 px-4 py-3 rounded-xl border transition-all ${
                      form.budget === b.id 
                        ? "bg-primary-600/10 border-primary-500/50 text-primary-300 shadow-sm"
                        : "bg-surface-900/50 border-white/5 text-zinc-500 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <b.icon className="w-4 h-4" />
                      <span className="text-xs font-bold whitespace-nowrap">{b.label}</span>
                    </div>
                    <span className="text-[9px] opacity-60 font-medium">{b.hint}</span>
                  </button>
                ))}
              </div>
            </FormGroup>

            <FormGroup label="Preferred Styles" description="Optional: Select as many as you like" icon={HelpCircle}>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    className={`cursor-pointer px-4 py-2 rounded-full text-[10px] font-bold transition-all border uppercase tracking-wide ${
                      form.stylePreferences.includes(s)
                        ? "bg-primary-600/20 border-primary-500 text-primary-300 ring-1 ring-primary-500/20"
                        : "bg-surface-900/40 border-white/5 text-zinc-500 hover:border-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FormGroup>
          </div>
        </FormCard>

        {/* Action area */}
        <div className="pt-4 flex flex-col items-center gap-5">
          {error && (
            <div className="w-full text-center py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: isValid && !loading ? 1.01 : 1 }}
            whileTap={{ scale: isValid && !loading ? 0.99 : 1 }}
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className={`cursor-pointer w-full py-4 rounded-xl font-display font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-xl ${
              isValid && !loading 
                ? "bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-500" 
                : "bg-surface-800 text-zinc-600 cursor-not-allowed grayscale"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><Target className="w-4 h-4" /> Get Styling Guides</>
            )}
          </motion.button>

          <button onClick={onBack} className="cursor-pointer inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-semibold uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

function FormGroup({ label, icon: Icon, description, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-surface-800 border border-white/5">
            <Icon className="w-3 h-3 text-zinc-500" />
          </div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">{label}</label>
        </div>
      </div>
      {children}
      {description && <p className="text-[10px] text-zinc-600 font-medium ml-1">{description}</p>}
    </div>
  );
}

function FormCard({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/[0.03]">
        <Icon className="w-4 h-4 text-primary-400" />
        <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
      </div>
      {children}
    </div>
  );
}
