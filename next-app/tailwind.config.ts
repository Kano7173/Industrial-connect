import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#121722', paper: '#f5f2ea', cobalt: '#245cff', orange: '#ff6548', lime: '#d9f35a' } } },
  plugins: [],
};
export default config;
