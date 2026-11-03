/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          ivory: '#FAF7F2',
          cream: '#FFFDF9',
          warmWhite: '#F7F4EE',
          gold: {
            light: '#F3E5AB',
            DEFAULT: '#D4AF37',
            dark: '#B38728',
            antique: '#C59B27'
          },
          wine: {
            light: '#7A1C28',
            DEFAULT: '#58111A',
            dark: '#3D0A11',
            deep: '#2D060C'
          },
          espresso: {
            light: '#42281D',
            DEFAULT: '#2A1810',
            dark: '#1A0E0A'
          },
          beige: {
            light: '#F8F4EE',
            DEFAULT: '#EADBC8',
            dark: '#DAC4AC'
          }
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'serif'],
        sans: ['"Montserrat"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(88, 17, 26, 0.1)',
        'luxury-hover': '0 20px 40px -15px rgba(88, 17, 26, 0.18)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

