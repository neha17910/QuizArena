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
        arena: {
          navy: '#0F172A',
          dark: '#0B0F19',
          card: '#1E293B',
          cardLight: '#334155',
          purple: '#7C3AED',
          purpleHover: '#6D28D9',
          purpleGlow: 'rgba(124, 58, 237, 0.4)',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          green: '#10B981',
          gold: '#F59E0B',
          silver: '#94A3B8',
          bronze: '#B45309',
          red: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glow-purple': '0 0 25px rgba(124, 58, 237, 0.35)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.35)',
        'glow-green': '0 0 25px rgba(16, 185, 129, 0.35)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      }
    },
  },
  plugins: [],
}
