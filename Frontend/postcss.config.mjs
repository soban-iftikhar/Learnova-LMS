export default {
  plugins: {
    "@tailwindcss/postcss": {
      content: [
        "./index.html",
        "./src/{pages,components}/**/*.{jsx,js}",
        "./src/App.jsx",
        "./src/main.jsx",
      ],
    },
  },
};
