import axios from 'axios'
import type { ApiEnvelope } from './types'
import { clearTokens, getAccessToken, refreshAccessToken } from './auth'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<boolean> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as { _retry?: boolean } | undefined
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      original &&
      !original._retry
    ) {
      original._retry = true
      if (!refreshing) {
        refreshing = refreshAccessToken()
          .then(() => true)
          .catch(() => {
            clearTokens()
            return false
          })
          .finally(() => {
            refreshing = null
          })
      }
      const ok = await refreshing
      if (ok && error.config) {
        const token = getAccessToken()
        error.config.headers.Authorization = `Bearer ${token}`
        return api.request(error.config)
      }
    }
    if (axios.isAxiosError(error)) {
      const envelope = error.response?.data as ApiEnvelope<unknown> | undefined
      error.message = envelope?.message ?? error.message
    }
    return Promise.reject(error)
  },
)

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data
}
