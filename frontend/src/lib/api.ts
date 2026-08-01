import axios from 'axios'
import type { ApiEnvelope } from './types'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
