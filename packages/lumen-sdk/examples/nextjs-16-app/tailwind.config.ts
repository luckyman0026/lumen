import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Using only Tailwind's amber and zinc palettes
        // These are already included in Tailwind, but we define them explicitly
        // for clarity and easy customization
      },
    },
  },
  plugins: [],
};

export default config;
