/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "box-col": 'repeat(3, 90px)'
      },
      gridTemplateRows: {
        "box-row": 'repeat(3, 90px)'
      }
    },
  },
  plugins: [],
}