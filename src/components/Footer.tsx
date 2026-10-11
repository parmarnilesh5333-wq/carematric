import { HeartPulse, Lock, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-obsidian-950 border-t border-white/10 text-slate-400 no-print">
      <div className="bg-violet-950/30 border-b border-violet-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="font-semibold text-white">
                Clinical &amp; AI Safety Disclaimer:
              </strong>{' '}
              CareMatric AI is a multifunctional AI and medical laboratory literacy platform. Medical explanations are strictly educational and do{' '}
              <span className="underline decoration-cyan-400 font-medium text-white">not</span>{' '}
              provide medical diagnosis, prescriptions, or medication dosage changes.
            </p>
          </div>
          <Link
            to="/disclaimer"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 whitespace-nowrap underline underline-offset-2"
          >
            Read Safety Policy &rarr;
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          <div className="md:col-span-5 space-y-3">
            <BrandLogo size="md" showTagline />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed pt-1">
              Multifunctional AI Assistant &amp; Clinical Report Analyzer supporting English, Hindi, Hinglish, Gujarati, and Urdu.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                Consent-Gated Privacy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Hallucination Lab Parser
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Smart Tools
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">
                  AI Assistant Chat
                </Link>
              </li>
              <li>
                <Link to="/medical" className="hover:text-cyan-400 transition-colors">
                  Medical Report Analyzer
                </Link>
              </li>
              <li>
                <Link to="/tools/study" className="hover:text-cyan-400 transition-colors">
                  Study AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/tools/coding" className="hover:text-cyan-400 transition-colors">
                  Coding AI Helper
                </Link>
              </li>
              <li>
                <Link to="/tools/documents" className="hover:text-cyan-400 transition-colors">
                  Document Analysis
                </Link>
              </li>
              <li>
                <Link to="/tools/translate" className="hover:text-cyan-400 transition-colors">
                  Translation Studio
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Languages
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>English</li>
              <li>हिन्दी (Hindi)</li>
              <li>Hinglish</li>
              <li>ગુજરાતી (Gujarati)</li>
              <li>اردو (Urdu RTL)</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Governance &amp; Legal
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy &amp; Data Minimization
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-cyan-400 transition-colors">
                  Medical Safety Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/dashboard/history" className="hover:text-cyan-400 transition-colors">
                  Saved Medical History
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} CareMatric AI. Multifunctional Intelligence &amp; Clinical Literacy.</p>
          <p className="text-[11px]">
            API keys remain strictly server-side in environment variables.
          </p>
        </div>
      </div>
    </footer>
  );
};
