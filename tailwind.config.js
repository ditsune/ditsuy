/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        hand: ['var(--font-caveat)', 'cursive'],
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        pink: { 50: '#FBEAF0', 100: '#F4C0D1', 200: '#ED93B1', 400: '#D4537E', 600: '#993556', 800: '#72243E', 900: '#4B1528' },
        coral: { 50: '#FAECE7', 400: '#D85A30', 800: '#712B13' },
        green: { 50: '#EAF3DE', 400: '#639922', 800: '#27500A' },
        blue: { 50: '#E6F1FB', 400: '#378ADD', 800: '#0C447C' },
        amber: { 50: '#FAEEDA', 400: '#BA7517', 800: '#633806' },
        purple: { 50: '#EEEDFE', 400: '#7F77DD', 800: '#3C3489' },
        teal: { 50: '#E1F5EE', 400: '#1D9E75', 800: '#085041' },
        bg: '#FFF7F9',
      },
    },
  },
  plugins: [],
};
