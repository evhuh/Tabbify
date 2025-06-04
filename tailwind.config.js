
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // "./src/**/*.{js,ts,jsx,tsx}"
    './src/App.tsx',          // Your React component
    './src/main.tsx',         // Your app entry file
    './src/index.css',        // Optional if using classnames here
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
