/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Paleta "Pizarra de Corcho"
        cork: {
          50: '#FFF8F0',
          100: '#F5F0E8',
          200: '#EADBC8',
          300: '#D4A574',
          400: '#C4956A',
          500: '#B8865C',
          600: '#A07050',
          700: '#8A6040',
          800: '#6A4A30',
          900: '#4A3728',
          DEFAULT: '#D4A574',
        },
        paper: {
          DEFAULT: '#FFF8F0',
          light: '#F5F0E8',
          dark: '#EADBC8',
        },
        wood: {
          light: '#B8865C',
          dark: '#4A3728',
        },
        accent: {
          orange: '#D97706',
          darkOrange: '#B45309',
        },
        // Clases auxiliares
        text: {
          DEFAULT: '#3E2723',
          secondary: '#4A3728',
          light: '#B8865C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        handwriting: ['"Comic Sans MS"', '"Segoe UI"', 'cursive'],
      },
      backgroundImage: {
        'cork': "url('https://www.transparenttextures.com/patterns/cork-board.png')",
      },
    },
  },
  plugins: [],
}
