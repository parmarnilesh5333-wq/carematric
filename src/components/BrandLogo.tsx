import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
}) => {
  const iconDimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textClass =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-br from-violet-600/30 via-obsidian-800 to-cyan-500/20 border border-violet-500/40 flex items-center justify-center shadow-glow-violet relative overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="cm-grad"
              x1="4"
              y1="4"
              x2="28"
              y2="28"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="55%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          {/* Neural + Medical Cross Matrix */}
          <rect
            x="13.5"
            y="4.5"
            width="5"
            height="23"
            rx="1.75"
            fill="url(#cm-grad)"
          />
          <rect
            x="4.5"
            y="13.5"
            width="23"
            height="5"
            rx="1.75"
            fill="url(#cm-grad)"
          />
          {/* Corner quantum/diagnostic nodes */}
          <circle cx="8" cy="8" r="2" className="fill-cyan-300" />
          <circle cx="24" cy="8" r="2" className="fill-violet-300" />
          <circle cx="8" cy="24" r="2" className="fill-violet-300" />
          <circle cx="24" cy="24" r="2" className="fill-cyan-300" />
          {/* Core diamond */}
          <rect
            x="14"
            y="14"
            width="4"
            height="4"
            rx="1"
            className="fill-obsidian-950"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <div
          className={`font-extrabold tracking-tight text-white leading-none flex items-center gap-1.5 ${textClass}`}
        >
          <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            CareMatric
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/40">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
            Multifunctional &amp; Clinical AI
          </span>
        )}
      </div>
    </div>
  );
};
