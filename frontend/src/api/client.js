// ─────────────────────────────────────────────────────────────
//  api/client.js  — Axios instance with auth interceptor
// ─────────────────────────────────────────────────────────────
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('naga_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear session and redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('naga_token')
      localStorage.removeItem('naga_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
