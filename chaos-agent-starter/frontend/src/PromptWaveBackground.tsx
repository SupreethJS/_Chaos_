import React from 'react';

export const PromptWaveBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`prompt-wave-canvas-wrap ${className}`} id="animated-svg-ANIMATION_2" aria-hidden="true">
      <svg
        className="prompt-wave-svg"
        viewBox="0 0 800 450"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dark Mode Glow Filter */}
          <filter id="glowDark" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" mode="over" />
          </filter>

          {/* Light Mode Glow Filter */}
          <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" mode="over" />
          </filter>

          {/* DARK MODE GRADIENTS */}
          <linearGradient id="gradCyanDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#4FACFE" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="gradMagentaDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0844" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FF4E50" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F9D423" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="gradVioletDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7F00FF" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#E100FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7F00FF" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="gradEmeraldDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0BA360" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#3CBA92" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#30E8BF" stopOpacity="0.25" />
          </linearGradient>

          {/* LIGHT MODE GRADIENTS (Vibrant, high-contrast, saturated) */}
          <linearGradient id="gradCyanLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="gradMagentaLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="gradVioletLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="gradEmeraldLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes pulseCoreWave {
            0%, 100% { transform: scale(1) translateY(0px); opacity: 0.9; }
            50% { transform: scale(1.05) translateY(-8px); opacity: 1; }
          }
          .prompt-core-orb {
            animation: pulseCoreWave 4s ease-in-out infinite;
          }
        `}</style>

        {/* Ambient Light Orbs */}
        <circle
          className="prompt-core-orb prompt-core-orb-1"
          cx="400"
          cy="225"
          r="140"
        />
        <circle
          className="prompt-core-orb prompt-core-orb-2"
          cx="350"
          cy="225"
          r="120"
          style={{ animationDelay: '-2s' }}
        />

        {/* Waveform 1: Cyan Ribbon */}
        <path className="prompt-wave prompt-wave-1">
          <animate
            attributeName="d"
            calcMode="spline"
            dur="4.5s"
            keyTimes="0; 0.5; 1"
            keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            repeatCount="indefinite"
            values="
              M0,225 C100,160 160,290 280,225 C400,160 480,280 600,210 C700,160 750,250 800,225 L800,225 C750,235 700,230 600,225 C480,220 400,230 280,225 C160,220 100,230 0,225 Z;
              M0,225 C120,290 200,140 320,225 C440,310 520,150 640,240 C720,290 760,190 800,225 L800,225 C760,230 720,220 640,225 C520,230 440,220 320,225 C200,230 120,220 0,225 Z;
              M0,225 C100,160 160,290 280,225 C400,160 480,280 600,210 C700,160 750,250 800,225 L800,225 C750,235 700,230 600,225 C480,220 400,230 280,225 C160,220 100,230 0,225 Z
            "
          />
        </path>

        {/* Waveform 2: Magenta / Ruby Ribbon */}
        <path className="prompt-wave prompt-wave-2">
          <animate
            attributeName="d"
            calcMode="spline"
            dur="5.8s"
            keyTimes="0; 0.5; 1"
            keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            repeatCount="indefinite"
            values="
              M0,225 C90,280 180,140 290,225 C390,300 490,130 610,235 C700,300 760,160 800,225 L800,225 C760,220 700,230 610,225 C490,220 390,230 290,225 C180,220 90,230 0,225 Z;
              M0,225 C110,150 210,310 330,225 C430,140 510,310 630,210 C710,150 770,270 800,225 L800,225 C770,230 710,220 630,225 C510,230 430,220 330,225 C210,230 110,220 0,225 Z;
              M0,225 C90,280 180,140 290,225 C390,300 490,130 610,235 C700,300 760,160 800,225 L800,225 C760,220 700,230 610,225 C490,220 390,230 290,225 C180,220 90,230 0,225 Z
            "
          />
        </path>

        {/* Waveform 3: Violet / Purple Flow */}
        <path className="prompt-wave prompt-wave-3">
          <animate
            attributeName="d"
            calcMode="spline"
            dur="6.4s"
            keyTimes="0; 0.5; 1"
            keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            repeatCount="indefinite"
            values="
              M0,225 C140,180 230,270 340,225 C450,180 540,270 650,225 C730,190 770,250 800,225 L800,225 C770,230 730,220 650,225 C540,230 450,220 340,225 C230,230 140,220 0,225 Z;
              M0,225 C130,270 240,170 360,235 C460,290 560,160 670,225 C740,260 780,190 800,225 L800,225 C780,220 740,230 670,225 C560,220 460,230 360,225 C240,220 130,230 0,225 Z;
              M0,225 C140,180 230,270 340,225 C450,180 540,270 650,225 C730,190 770,250 800,225 L800,225 C770,230 730,220 650,225 C540,230 450,220 340,225 C230,230 140,220 0,225 Z
            "
          />
        </path>

        {/* Waveform 4: Emerald Green Aurora Stream */}
        <path className="prompt-wave prompt-wave-4">
          <animate
            attributeName="d"
            calcMode="spline"
            dur="5.1s"
            keyTimes="0; 0.5; 1"
            keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            repeatCount="indefinite"
            values="
              M0,225 C120,250 200,190 310,225 C420,260 500,180 620,230 C710,260 760,195 800,225 L800,225 C760,220 710,225 620,225 C500,225 420,220 310,225 C200,230 120,220 0,225 Z;
              M0,225 C100,190 190,260 300,215 C410,170 520,270 615,220 C705,185 755,245 800,225 L800,225 C755,230 705,225 615,225 C520,225 410,230 300,225 C190,220 100,230 0,225 Z;
              M0,225 C120,250 200,190 310,225 C420,260 500,180 620,230 C710,260 760,195 800,225 L800,225 C760,220 710,225 620,225 C500,225 420,220 310,225 C200,230 120,220 0,225 Z
            "
          />
        </path>

        {/* Central Sharp Luminous Core Line */}
        <path
          className="prompt-core-line"
          d="M0,225 Q200,215 400,225 T800,225"
          fill="none"
        >
          <animate
            attributeName="d"
            calcMode="spline"
            dur="3.2s"
            keyTimes="0; 0.5; 1"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            repeatCount="indefinite"
            values="
              M0,225 Q200,170 400,225 T800,225;
              M0,225 Q200,280 400,225 T800,225;
              M0,225 Q200,170 400,225 T800,225
            "
          />
        </path>
      </svg>
    </div>
  );
};
