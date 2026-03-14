/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfaf4',
          100: '#d3f3e4',
          200: '#aae5cb',
          300: '#72d1ab',
          400: '#3db588',
          500: '#1f9b6e',
          600: '#137d59',
          700: '#106449',
          800: '#10503b',
          900: '#0e4232',
          950: '#07251d',
        },
        ink: {
          DEFAULT: '#0d1117',
          soft: '#1c2433',
          muted: '#2d3748',
        },
        surface: {
          DEFAULT: '#f7f9fc',
          card: '#ffffff',
          muted: '#eef1f6',
        },
        accent: {
          amber: '#f59e0b',
          rose:  '#f43f5e',
          sky:   '#0ea5e9',
          violet:'#7c3aed',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 16px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 16px 40px 0 rgba(0,0,0,0.06)',
        glow: '0 0 24px rgba(31,155,110,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
