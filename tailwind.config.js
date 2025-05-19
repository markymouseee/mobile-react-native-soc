/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins_400Regular', 'Poppins_700Bold'],
      },
      colors: {
        purple: {
          500: '#7e3af2', // your purple shade
          600: '#6b21a8',
        },
        green: {
          300: '#a7f3d0', // soft green for text & placeholders
          400: '#34d399', // brighter green for tagline
          200: '#bbf7d0',
        },
        darkblue: {
          DEFAULT: '#0f172a', // dark blue background
          light: '#1e293b',  // lighter dark blue for inputs
        },
      },
    },
  },
  plugins: [],
}