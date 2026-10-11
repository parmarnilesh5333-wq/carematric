import { Globe } from 'lucide-react';
import React from 'react';
import {
  MEDICAL_REPORT_LANGUAGES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../types/report';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  variant?: 'pills' | 'compact';
  medicalOnly?: boolean;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  variant = 'pills',
  medicalOnly = false,
  disabled = false,
}) => {
  const options = medicalOnly ? MEDICAL_REPORT_LANGUAGES : SUPPORTED_LANGUAGES;

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-obsidian-800/90 border border-white/10 hover:border-violet-500/40 rounded-xl px-2.5 py-1.5 transition-colors">
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <label htmlFor="carematric-lang-select" className="sr-only">
          Select Language
        </label>
        <select
          id="carematric-lang-select"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as SupportedLanguage)}
          className="bg-obsidian-800 text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-1"
        >
          {options.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-obsidian-900 text-slate-100"
            >
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-obsidian-900/90 border border-white/10"
      role="group"
      aria-label="Select preferred language"
    >
      {options.map((lang) => {
        const active = value === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            disabled={disabled}
            onClick={() => onChange(lang.code)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              active
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm border border-violet-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span>{lang.nativeName}</span>
            {lang.code !== 'en' && lang.code !== 'hinglish' && (
              <span className="text-[10px] font-normal opacity-75">
                {lang.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
