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
      colors: {
        swin: {
          red: '#C82333',
          charcoal: '#343642',
          black: '#000000',
          ivory: '#FEFDFD',
          'dark-bg': '#0F1115', // Deep Gunmetal
          'dark-surface': '#181B21', // Deep Gunmetal Surface
        },
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
