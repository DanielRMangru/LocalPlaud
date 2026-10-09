/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plaud: {
          bg: '#0B0F17',
          surface: '#121826',
          card: '#182234',
          border: '#243049',
          accent: '#6366F1',
          accentHover: '#4F46E5',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#A855F7',
          muted: '#8E9BAE',
          text: '#F1F5F9',
        },
        speaker: {
          1: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', text: '#818CF8' },
          2: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#34D399' },
          3: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FBBF24' },
          4: { bg: 'rgba(244, 63, 94, 0.15)', border: '#F43F5E', text: '#FB7185' },
          5: { bg: 'rgba(168, 85, 247, 0.15)', border: '#A855F7', text: '#C084FC' },
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { height: '4px' },
          '100%': { height: '24px' }
        }
      }
    },
  },
  plugins: [],
}
