import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import motion from './eslint-rules/motion/index.js';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['app/**/*.ts', 'app/**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
      motion,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'motion/no-linear-easing': 'error',
      'motion/no-layout-animation': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // CommonJS rule plugin files — treat as Node CJS, skip TS rules
    files: ['eslint-rules/**/*.js'],
    languageOptions: {
      globals: {
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', '.worktrees/**', '.superpowers/**', 'mcp/**'],
  },
];
