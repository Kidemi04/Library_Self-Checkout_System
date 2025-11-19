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
        },
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
