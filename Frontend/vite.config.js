// learnova-frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Every /api/... request from the frontend is forwarded to Spring Boot.
      // Spring Boot itself has context-path=/api, so /api stays in the URL.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Do NOT rewrite — keep /api in the path so Spring sees it correctly.
      },
    },
  },
})
