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
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        // Legacy Swinburne tokens (RETAINED in Batch 1; deleted in Batch 3)
        swin: {
          red: '#C82333',
          charcoal: '#343642',
          black: '#000000',
          ivory: '#FEFDFD',
          gold: '#C9A961',
          'dark-bg': '#0F1115',
          'dark-surface': '#181B21',
        },

        // Brand: dual-track Swinburne red
        'swin-red-brand': '#C82333',          // logo / brand-mark only
        primary:          '#B83A35',          // UI CTA, links, focus rings
        'primary-active': '#9A2D29',
        'primary-disabled': '#E6DFD8',
        'dark-primary':   '#CC4640',          // dark-mode primary

        // Surface — light
        canvas:                 '#FAF9F5',
        'surface-soft':         '#F5F0E8',
        'surface-card':         '#EFE9DE',
        'surface-cream-strong': '#E8E0D2',
        hairline:               '#E6DFD8',
        'hairline-soft':        '#EBE6DF',

        // Surface — dark
        'dark-canvas':          '#181715',
        'dark-surface-soft':    '#1F1E1B',
        'dark-surface-card':    '#252320',
        'dark-surface-strong':  '#2D2B27',
        'dark-hairline':        '#3A3733',

        // Text
        ink:           '#141413',
        'body-strong': '#252523',
        body:          '#3D3D3A',
        muted:         '#6C6A64',
        'muted-soft':  '#8E8B82',
        'on-primary':  '#FFFFFF',
        'on-dark':     '#FAF9F5',
        'on-dark-soft':'#A09D96',

        // Accent
        'accent-teal':  '#5DB8A6',
        'accent-amber': '#E8A55A',

        // Semantic
        success: '#5DB872',
        warning: '#D4A017',
        error:   '#C64545',
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
