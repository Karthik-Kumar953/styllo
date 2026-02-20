import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid, 
} from "recharts";
import {
  LayoutDashboard, Users, Activity, Palette, Shirt, Clock,
  TrendingUp, ChevronLeft, RefreshCw, Loader2, AlertCircle,
  ArrowLeft,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Chart colors
const COLORS = ["#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#6366f1", "#f43f5e", "#14b8a6"];
const MODE_COLORS = { photo: "#a855f7", text: "#06b6d4", form: "#f59e0b", Unknown: "#6b7280" };

// Custom tooltip for dark theme
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl backdrop-blur-md">
      <p className="text-zinc-300 text-xs font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// Custom pie label
function renderPieLabel({ name, percent }) {
  return percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : "";
}

export default function AdminPanel({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else throw new Error(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "demographics", label: "Demographics", icon: Users },
    { id: "styles", label: "Styles & Preferences", icon: Shirt },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "sessions", label: "Recent Sessions", icon: Clock },
  ];

  return (
    <div className="min-h-screen w-full bg-surface-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/5">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-400" />
            <span className="font-display font-bold text-sm gradient-text">Styllo Admin</span>
          </div>
          <button onClick={fetchStats} className="cursor-pointer flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      <div className="flex w-full">
        {/* Sidebar */}
        <nav className="hidden sm:flex flex-col w-56 min-h-[calc(100vh-56px)] glass border-r border-white/5 p-3 gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-primary-600/20 to-transparent text-primary-300 border-l-2 border-primary-500"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Mobile tabs */}
        <div className="sm:hidden w-full flex overflow-x-auto gap-1 p-2 border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? "bg-primary-600/20 text-primary-300"
                  : "text-zinc-500"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={fetchStats} className="cursor-pointer px-4 py-2 rounded-lg bg-primary-600/20 text-primary-300 text-sm">
                Retry
              </button>
            </div>
          )}

          {stats && !loading && (
            <>
              {activeTab === "overview" && <OverviewTab stats={stats} />}
              {activeTab === "demographics" && <DemographicsTab stats={stats} />}
              {activeTab === "styles" && <StylesTab stats={stats} />}
              {activeTab === "trends" && <TrendsTab stats={stats} />}
              {activeTab === "sessions" && <SessionsTab stats={stats} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, icon: Icon, color = "text-primary-400", gradient = "from-primary-600/15" }) {
  return (
    <div className={`glass rounded-xl p-5 bg-gradient-to-br ${gradient} to-transparent`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

// ── Chart Card ──
function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`glass rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ═══════════ OVERVIEW TAB ═══════════
function OverviewTab({ stats }) {
  const topTone = stats.bySkinTone[0]?.name || "—";
  const topMode = stats.byMode[0]?.name || "—";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Dashboard Overview</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={stats.totalSessions} icon={Activity} />
        <StatCard label="Today's Sessions" value={stats.todayCount} icon={TrendingUp} color="text-emerald-400" gradient="from-emerald-600/15" />
        <StatCard label="Most Popular Tone" value={topTone} icon={Palette} color="text-amber-400" gradient="from-amber-500/15" />
        <StatCard label="Top Input Mode" value={topMode} icon={LayoutDashboard} color="text-cyan-400" gradient="from-cyan-600/15" />
      </div>

      {/* Sessions timeline */}
      <ChartCard title="Sessions — Last 30 Days">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stats.timeline}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} />
            <Area type="monotone" dataKey="sessions" stroke="#a855f7" fill="url(#areaGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Mode + Gender summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Input Mode Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.byMode} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={renderPieLabel} labelLine={false}>
                {stats.byMode.map((entry, i) => (
                  <Cell key={i} fill={MODE_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.byGender} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={renderPieLabel} labelLine={false}>
                {stats.byGender.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════ DEMOGRAPHICS TAB ═══════════
function DemographicsTab({ stats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Demographics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender pie */}
        <ChartCard title="Gender Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.byGender} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={renderPieLabel} labelLine={false}>
                {stats.byGender.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age range bar */}
        <ChartCard title="Age Range Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.byAgeRange} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} width={60} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="value" name="Sessions" radius={[0, 6, 6, 0]}>
                {stats.byAgeRange.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Skin tone bar */}
        <ChartCard title="Skin Tone Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.bySkinTone}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="value" name="Sessions" radius={[6, 6, 0, 0]}>
                {stats.bySkinTone.map((entry, i) => {
                  const toneColors = { Fair: "#FDDCB5", Light: "#E8C9A0", Medium: "#D4A574", Olive: "#A67C52", Deep: "#8B5E3C", Dark: "#6B4226" };
                  return <Cell key={i} fill={toneColors[entry.name] || COLORS[i]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Undertone pie */}
        <ChartCard title="Undertone Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.byUndertone} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={renderPieLabel} labelLine={false}>
                {stats.byUndertone.map((_, i) => {
                  const utColors = ["#f59e0b", "#06b6d4", "#6b7280"];
                  return <Cell key={i} fill={utColors[i] || COLORS[i]} />;
                })}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════ STYLES TAB ═══════════
function StylesTab({ stats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Styles & Preferences</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Style preferences bar */}
        <ChartCard title="Most Popular Style Preferences" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.byStylePref}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="value" name="Users" radius={[6, 6, 0, 0]}>
                {stats.byStylePref.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Occasion pie */}
        <ChartCard title="Occasion Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.byOccasion} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={renderPieLabel} labelLine={false}>
                {stats.byOccasion.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Budget pie */}
        <ChartCard title="Budget Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.byBudget} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={renderPieLabel} labelLine={false}>
                {stats.byBudget.map((_, i) => {
                  const bColors = ["#10b981", "#f59e0b", "#a855f7"];
                  return <Cell key={i} fill={bColors[i] || COLORS[i]} />;
                })}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════ TRENDS TAB ═══════════
function TrendsTab({ stats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Trends</h2>

      <ChartCard title="Sessions Over Time — Last 30 Days">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={stats.timeline}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} />
            <Area type="monotone" dataKey="sessions" stroke="#a855f7" fill="url(#trendGrad)" strokeWidth={2.5} dot={{ fill: "#a855f7", r: 3 }} activeDot={{ r: 5, fill: "#e879f9" }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Mode over time implied by summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Sessions" value={stats.totalSessions} icon={Activity} />
        <StatCard label="Today" value={stats.todayCount} icon={TrendingUp} color="text-emerald-400" gradient="from-emerald-600/15" />
        <StatCard
          label="Avg per Day (30d)"
          value={(stats.totalSessions > 0 ? (stats.timeline.reduce((s, t) => s + t.sessions, 0) / 30).toFixed(1) : "0")}
          icon={Clock}
          color="text-cyan-400"
          gradient="from-cyan-600/15"
        />
      </div>
    </div>
  );
}

// ═══════════ SESSIONS TAB ═══════════
function SessionsTab({ stats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Recent Sessions</h2>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">Session ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">Mode</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">Gender</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">Skin Tone</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">Details</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSessions.map((s, i) => (
                <tr key={s.sessionId || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-zinc-600 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{(s.sessionId || "").slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.mode === "photo" ? "bg-primary-600/20 text-primary-300" :
                      s.mode === "text" ? "bg-cyan-600/20 text-cyan-300" :
                      s.mode === "form" ? "bg-amber-500/20 text-amber-300" :
                      "bg-zinc-600/20 text-zinc-400"
                    }`}>
                      {s.mode || "photo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300">{s.gender || s.formData?.gender || "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-300">{s.skinTone || s.formData?.skinTone || "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 max-w-[200px] truncate">
                    {s.textPrompt ? `"${s.textPrompt.slice(0, 50)}…"` :
                     s.formData?.occasion ? `${s.formData.occasion}, ${s.formData.budget}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              ))}
              {stats.recentSessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No sessions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
