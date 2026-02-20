import { Sparkles, Heart } from "lucide-react";

export default function Footer({ onGetStarted }) {
  return (
    <footer className="w-full border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* CTA Banner */}
        <div className="text-center mb-12 py-12 sm:py-16 rounded-2xl glass glow-purple">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
            Ready to Find Your <span className="gradient-text">Perfect Style</span>?
          </h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto px-4">
            It takes 10 seconds. No sign-up. No uploads. Completely free.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-primary-600 to-rose-500 text-white font-semibold text-sm hover:shadow-xl hover:shadow-primary-500/25 transition-shadow"
          >
            Get Started — It's Free
          </button>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="font-display font-bold text-sm gradient-text">Styllo</span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-zinc-600 text-xs">AI Fashion Advisor</span>
          </div>

          <p className="flex items-center gap-1 text-xs text-zinc-600">
            Built with <Heart className="w-3 h-3 text-rose-500" /> for Hackathons
          </p>
        </div>
      </div>
    </footer>
  );
}
