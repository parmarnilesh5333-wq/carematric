import { ArrowRight, Menu, Sparkles, Stethoscope, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const { preferredLanguage, setPreferredLanguage } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-obsidian-950/90 backdrop-blur-xl border-b border-white/10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="focus:outline-none">
            <BrandLogo size="md" showTagline />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">
              AI Assistant Home
            </Link>
            <Link to="/medical" className="hover:text-cyan-400 transition-colors">
              Medical Reports
            </Link>
            <Link to="/tools/study" className="hover:text-cyan-400 transition-colors">
              Study AI
            </Link>
            <Link to="/tools/coding" className="hover:text-cyan-400 transition-colors">
              Coding AI
            </Link>
            <Link to="/tools/documents" className="hover:text-cyan-400 transition-colors">
              Document Q&amp;A
            </Link>
            <Link to="/tools/translate" className="hover:text-cyan-400 transition-colors">
              Translation
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector
            value={preferredLanguage}
            onChange={setPreferredLanguage}
            variant="compact"
          />

          <Link
            to="/medical"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyze Lab Report</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-violet transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch AI Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector
            value={preferredLanguage}
            onChange={setPreferredLanguage}
            variant="compact"
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-300 hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-obsidian-900 border-b border-white/10 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            AI Assistant Home
          </Link>
          <Link
            to="/medical"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Medical Report Analyzer
          </Link>
          <Link
            to="/tools/study"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Study AI
          </Link>
          <Link
            to="/tools/coding"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Coding AI
          </Link>
          <Link
            to="/tools/documents"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Document Analysis
          </Link>
          <Link
            to="/tools/translate"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Translation Studio
          </Link>
        </div>
      )}
    </header>
  );
};
