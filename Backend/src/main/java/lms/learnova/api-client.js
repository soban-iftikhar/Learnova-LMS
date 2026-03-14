// src/api/client.js  ── drop-in replacement for the frontend
import axios from 'axios'

// When running via Vite dev server the proxy strips nothing —
// requests to /api/... are forwarded verbatim to localhost:8080/api/...
// In production set VITE_API_URL to your deployed backend root e.g. https://api.learnova.io/api
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor: attach access token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────
let isRefreshing = false
let queue = []

const flush = (err, token = null) => {
  queue.forEach(p => (err ? p.reject(err) : p.resolve(token)))
  queue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return apiClient(original) })
          .catch(e => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
        localStorage.setItem('access_token', data.access_token)
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
        flush(null, data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch (err) {
        flush(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
