/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./app/**/*.{js,ts,jsx,tsx}", // App Router
      "./pages/**/*.{js,ts,jsx,tsx}", // Legacy Pages Router (si existiera)
      "./components/**/*.{js,ts,jsx,tsx}", // Componentes
  ],
  theme: {
      extend: {},
  },
  plugins: [],
};
