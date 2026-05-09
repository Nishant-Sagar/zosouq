/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FDF8EE',
          100: '#F8EDCA',
          200: '#F0D995',
          300: '#E8C560',
          400: '#DDB447',
          500: '#C8A43A',
          600: '#B08C28',
          700: '#8A6C18',
          800: '#644E0C',
          900: '#3E3005',
        },
        luxury: {
          DEFAULT: '#1A0800',
          50:  '#2D1200',
          100: '#3D1800',
          200: '#5C2400',
          800: '#0D0400',
          900: '#070200',
        },
        gold: '#C8A43A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'ken-burns': 'kenBurns 8s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        kenBurns: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.05)' } },
      },
    },
  },
  plugins: [],
}
