import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bottom-[68px]',
    'bottom-[70px]',
    'bottom-[72px]',
    'px-8',
    'px-12',
    'px-14',
    'px-16',
    'bottom-[calc(env(safe-area-inset-bottom)+68px)]',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      fontFamily: {
        display: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
        mono:    ['var(--font-jetbrains-mono)', '"SF Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-1.5px', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '1.10', letterSpacing: '-1px',   fontWeight: '400' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.5px', fontWeight: '400' }],
        'display-sm': ['28px', { lineHeight: '1.20', letterSpacing: '-0.3px', fontWeight: '400' }],
        'title-lg':   ['22px', { lineHeight: '1.30', letterSpacing: '0',      fontWeight: '500' }],
        'title-md':   ['18px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
        'title-sm':   ['16px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
        'body-md':    ['16px', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
        'body-sm':    ['14px', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
        caption:      ['13px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
        'caption-uppercase': ['11px', { lineHeight: '1.40', letterSpacing: '1.5px', fontWeight: '500' }],
        code:         ['14px', { lineHeight: '1.60', letterSpacing: '0',      fontWeight: '400' }],
        button:       ['14px', { lineHeight: '1',    letterSpacing: '0',      fontWeight: '500' }],
        'nav-link':   ['14px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        hero: '16px',
        pill: '9999px',
      },
      spacing: {
        section: '96px',
      },
      colors: {
        // Legacy Swinburne tokens — Batch 3 cleanup retained `red` (used by
        // bg-swin-red/text-swin-red across surfaces still showing brand red)
        // and `black` (tooling). Charcoal/ivory/gold/dark-bg/dark-surface
        // dropped per spec §7 acceptance criterion (Chat 16 Task 30).
        swin: {
          red: '#C82333',
          black: '#000000',
        },

        // Brand: dual-track Swinburne red
        'swin-red-brand': '#DA291C',          // logo / brand-mark only
        primary:          '#DA291C',          // UI CTA, links, focus rings
        'primary-active': '#B32218',
        'primary-disabled': '#E0E0E0',
        'dark-primary':   '#E84040',          // dark-mode primary

        // Surface — light
        canvas:                 '#FFFFFF',
        'surface-soft':         '#F5F5F5',
        'surface-card':         '#F5F5F5',
        'surface-cream-strong': '#F5F5F5',
        hairline:               '#E0E0E0',
        'hairline-soft':        '#E0E0E0',

        // Surface — dark
        'dark-canvas':          '#121212',
        'dark-surface-soft':    '#1E1E1E',
        'dark-surface-card':    '#1E1E1E',
        'dark-surface-strong':  '#1E1E1E',
        'dark-hairline':        '#2A2A2A',

        // Text
        ink:           '#000000',
        'body-strong': '#000000',
        body:          '#000000',
        muted:         '#000000',
        'muted-soft':  '#000000',
        'on-primary':  '#FFFFFF',
        'on-dark':     '#F0F0F0',
        'on-dark-soft':'#F0F0F0',

        // Accent
        'accent-teal':  '#000000',
        'accent-amber': '#000000',

        // Semantic
        success: '#000000',
        warning: '#000000',
        error:   '#DA291C',

        // Third-party brand
        linkedin:        '#0A66C2',
        'linkedin-active': '#004182',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
      "border-beam": {
        "100%": {
          "offset-distance": "100%",
        },
      },
      "spin-around": {
        "0%": {
          transform: "translateZ(0) rotate(0)",
        },
        "100%": {
          transform: "translateZ(0) rotate(360deg)",
        },
      },
      "shimmer-slide": {
        to: {
          transform: "translate(calc(100cqw - 100%), 0)",
        },
      },
    },
    animation: {
      "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
