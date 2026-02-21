import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

/**
 * StyleDNACard — Spotify-Wrapped–style shareable identity card.
 *
 * Renders at 1080×1920 (9:16 Instagram Story) internally.
 * Uses a React Portal to overlay on top of EVERYTHING (fixes
 * broken `position: fixed` caused by Framer Motion transforms).
 *
 * On download, the CSS `transform: scale()` is stripped via
 * html-to-image's `style` override so the full 1080×1920 is captured.
 */
export default function StyleDNACard({ dna, colors = [], skinTone, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(0.3); // safe default

  // Card native dimensions — 9:16 Story format
  const W = 1080;
  const H = 1920;

  // Dynamically calculate scale to fit viewport
  useEffect(() => {
    function calcScale() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 120; // room for buttons + margins
      const availH = vh - pad;
      const availW = vw - 64; // side padding
      const s = Math.min(availW / W, availH / H, 1);
      setScale(s);
    }
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, []);

  // Lock body scroll while card is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!dna) return null;

  const topColors = (colors || []).slice(0, 5);
  const percentile = Math.max(88, Math.min(99, (dna.styleScore || 85) + Math.floor(Math.random() * 8)));
  const seasonEmoji = { Spring: "🌸", Summer: "☀️", Autumn: "🍂", Winter: "❄️" }[dna.colorSeason] || "✨";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Override transform so we capture at native 1080×1920, not scaled
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 1,
        width: W,
        height: H,
        style: {
          transform: "none",
          position: "static",
        },
      });
      const link = document.createElement("a");
      link.download = `styllo-dna-${dna.archetype?.replace(/\s+/g, "-").toLowerCase() || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate card:", err);
    }
    setDownloading(false);
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 1,
        width: W,
        height: H,
        style: {
          transform: "none",
          position: "static",
        },
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "styllo-dna.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `My Style DNA — ${dna.archetype}`, text: dna.tagline, files: [file] });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  const previewW = Math.round(W * scale);
  const previewH = Math.round(H * scale);

  // Render via Portal so Framer Motion transforms on ancestors don't break position:fixed
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: -8, right: -8, zIndex: 50,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(39,39,42,0.8)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#a1a1aa", cursor: "pointer",
          }}
        >
          <X size={14} />
        </button>

        {/* Scaled Card Preview */}
        <div
          style={{
            width: previewW,
            height: previewH,
            position: "relative",
            overflow: "hidden",
            borderRadius: Math.round(16 * scale),
            boxShadow: "0 25px 80px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          <div
            ref={cardRef}
            style={{
              width: W,
              height: H,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
          >
            <InnerCard dna={dna} topColors={topColors} skinTone={skinTone} percentile={percentile} seasonEmoji={seasonEmoji} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: previewW }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 0", borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
              color: "white", fontWeight: 700, fontSize: 14,
              border: "none", cursor: "pointer",
              boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
              opacity: downloading ? 0.6 : 1,
            }}
          >
            <Download size={16} />
            {downloading ? "Saving..." : "Save Card"}
          </button>
          <button
            onClick={handleShare}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 0", borderRadius: 12,
              background: "rgba(39,39,42,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white", fontWeight: 700, fontSize: 14,
              cursor: "pointer",
            }}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────
   The actual 1080×1920 card — 9:16 Story format
   ───────────────────────────────────────────────────── */
function InnerCard({ dna, topColors, skinTone, percentile, seasonEmoji }) {
  const accent = topColors[0]?.hex || "#8b5cf6";
  const accent2 = topColors[1]?.hex || "#ec4899";
  const accent3 = topColors[2]?.hex || "#f59e0b";

  const mantra = dna.styleMantra
    || `Dress like ${dna.archetype?.split(" ").pop() || "you"}, shine like ${dna.metalMatch?.toLowerCase() || "gold"}.`;

  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(165deg, #0a0015 0%, ${accent}12 30%, #12061f 55%, ${accent2}10 80%, #06010d 100%)`,
      color: "white",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* ── Ambient glow blobs ── */}
      <div style={{ position: "absolute", top: -150, right: -100, width: 600, height: 600, background: `radial-gradient(circle, ${accent}30 0%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: 200, left: -150, width: 500, height: 500, background: `radial-gradient(circle, ${accent2}22 0%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", top: "45%", right: -100, width: 400, height: 400, background: `radial-gradient(circle, ${accent3}15 0%, transparent 65%)`, borderRadius: "50%", filter: "blur(50px)" }} />

      {/* ── HEADER — Styllo branding ── */}
      <div style={{ padding: "56px 64px 0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(139,92,246,0.4)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
            </svg>
          </div>
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase", background: "linear-gradient(135deg, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            STYLLO
          </span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>2025</span>
      </div>

      {/* ── HERO — Archetype Title ── */}
      <div style={{ padding: "40px 64px 0", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: 8, color: accent, marginBottom: 12, opacity: 0.9 }}>
          YOUR STYLE DNA
        </p>
        <h1 style={{
          fontSize: 72, fontWeight: 900, lineHeight: 1.05, marginBottom: 16,
          background: `linear-gradient(135deg, #ffffff 0%, ${accent}90 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {dna.archetype || "Style Icon"}
        </h1>
        <p style={{ fontSize: 22, fontStyle: "italic", color: "rgba(255,255,255,0.4)", lineHeight: 1.45, maxWidth: 900 }}>
          "{dna.tagline || "Your style speaks before you do"}"
        </p>
      </div>

      {/* ── SCORE + PERCENTILE row ── */}
      <div style={{ padding: "36px 64px 0", display: "flex", alignItems: "flex-end", gap: 20, position: "relative", zIndex: 1 }}>
        <span style={{
          fontSize: 130, fontWeight: 900, lineHeight: 1,
          background: `linear-gradient(180deg, ${accent} 20%, ${accent2} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {dna.styleScore || 85}
        </span>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 4 }}>STYLE</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 4 }}>SCORE</p>
        </div>
        <div style={{
          marginLeft: "auto", marginBottom: 18,
          padding: "12px 28px", borderRadius: 30,
          background: `linear-gradient(135deg, ${accent}25, ${accent2}18)`,
          border: `1px solid ${accent}40`,
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: accent }}>
            Top {100 - percentile}% of fashion
          </span>
        </div>
      </div>

      {/* ── POWER PALETTE ── */}
      <div style={{ padding: "32px 64px 0", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 6, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>
          YOUR POWER PALETTE
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {topColors.map((c, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                width: "100%", height: 68, borderRadius: 16,
                backgroundColor: c.hex,
                boxShadow: `0 6px 24px ${c.hex}40`,
                border: "1px solid rgba(255,255,255,0.06)",
              }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700, display: "block", marginTop: 6, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
                {(c.color || "").split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ROW — Season · Metal · Pattern ── */}
      <div style={{
        padding: "28px 64px 0", position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14,
      }}>
        <StatBox emoji={seasonEmoji} label="COLOR SEASON" value={dna.colorSeason || "—"} accent={accent} />
        <StatBox emoji={dna.metalMatch === "Gold" ? "🥇" : dna.metalMatch === "Silver" ? "🥈" : "🌹"} label="YOUR METAL" value={dna.metalMatch || "—"} accent={accent2} />
        <StatBox emoji="🎨" label="SIGNATURE" value={dna.signaturePattern || "—"} accent={accent3} />
      </div>

      {/* ── FABRICS + CELEBRITY — 2-column layout ── */}
      <div style={{
        padding: "24px 64px 0", position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
      }}>
        {/* Fabrics */}
        {dna.bestFabrics?.length > 0 && (
          <div style={{
            padding: "24px 28px", borderRadius: 22,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>
              BEST FABRICS
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {dna.bestFabrics.map((f, i) => (
                <span key={i} style={{
                  padding: "10px 20px", borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.03)",
                  fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Celebrity Match */}
        {dna.celebrityMatch && (
          <div style={{
            padding: "24px 28px", borderRadius: 22,
            background: `linear-gradient(135deg, ${accent}10, ${accent2}06)`,
            border: `1px solid ${accent}15`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 42 }}>👯</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>
                STYLE TWIN
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.85)" }}>
                {dna.celebrityMatch}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── SEASON INSIGHT ── */}
      {dna.seasonDescription && (
        <div style={{ padding: "28px 64px 0", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 6, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>
            WHY {(dna.colorSeason || "YOUR SEASON").toUpperCase()} {seasonEmoji}
          </p>
          <p style={{ fontSize: 20, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            {dna.seasonDescription}
          </p>
        </div>
      )}

      {/* ── STYLE MANTRA ── */}
      <div style={{
        margin: "28px 64px 0", padding: "28px 32px", borderRadius: 22,
        background: `linear-gradient(135deg, ${accent}08, transparent 60%)`,
        borderLeft: `3px solid ${accent}50`,
        position: "relative", zIndex: 1,
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5, color: "rgba(255,255,255,0.15)", marginBottom: 10 }}>
          YOUR STYLE MANTRA
        </p>
        <p style={{ fontSize: 24, fontWeight: 700, fontStyle: "italic", lineHeight: 1.5, color: "rgba(255,255,255,0.50)" }}>
          "{mantra}"
        </p>
      </div>

      {/* ── SPACER + FOOTER ── */}
      <div style={{ flex: 1, minHeight: 20 }} />
      <div style={{
        padding: "0 64px 56px", display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", position: "relative", zIndex: 1,
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.15)", marginBottom: 6 }}>
            Generated by Styllo AI
          </p>
          <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.1)" }}>
            Discover your perfect style → styllo.app
          </p>
        </div>
        <div style={{
          padding: 10, background: "white", borderRadius: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <QRCodeSVG
            value="https://styllo.onrender.com/"
            size={64}
            bgColor="white"
            fgColor="#0a0015"
            level="M"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Stat Box ── */
function StatBox({ emoji, label, value, accent }) {
  return (
    <div style={{
      padding: "20px 22px", borderRadius: 20,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{emoji}</span>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 4, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 900, color: accent || "#e4e4e7" }}>
        {value}
      </p>
    </div>
  );
}
