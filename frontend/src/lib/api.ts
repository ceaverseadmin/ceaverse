import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from './types'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
} from './auth'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

/**
 * Endpoints that work without authentication for any method. The bearer token
 * is never attached here, so a stale token can't return a 401 on a public
 * endpoint (DRF authenticates before checking AllowAny) or block logging in.
 */
const PUBLIC_API_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/refresh',
  '/landing/content',
  '/lost-found/items',
  '/lost-found/track',
  '/voice',
]

/**
 * Endpoints that are public for safe (read) methods only — their write
 * methods still require an administrator token.
 */
const PUBLIC_READ_ONLY_PATHS = ['/ebooks', '/floorplans', '/wayfinding']

function matchesPublicPrefix(url: string, prefix: string): boolean {
  if (!url.startsWith(prefix)) return false
  // A public prefix must not swallow its admin sub-routes.
  return !url.slice(prefix.length).startsWith('/admin')
}

function isPublicPath(url?: string, method?: string): boolean {
  if (!url) return false
  if (PUBLIC_API_PATHS.some((path) => matchesPublicPrefix(url, path))) {
    return true
  }
  const verb = (method ?? 'get').toUpperCase()
  return (
    SAFE_METHODS.includes(verb) &&
    PUBLIC_READ_ONLY_PATHS.some((path) => matchesPublicPrefix(url, path))
  )
}

api.interceptors.request.use((config) => {
  if (isPublicPath(config.url, config.method)) return config
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<boolean> | null = null

function refreshOnce(): Promise<boolean> {
  if (!refreshing) {
    refreshing = refreshAccessToken()
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

function expireSession(): void {
  clearTokens()
  window.dispatchEvent(new CustomEvent('ea:session-expired'))
}

/**
 * Refresh tokens rotate and blacklist on use, so when two tabs refresh at the
 * same time only the first succeeds. If this tab's refresh failed because a
 * sibling tab already rotated the pair, pick up the new tokens from
 * localStorage instead of logging the user out.
 */
async function waitForOutOfBandRefresh(
  refreshTokenAtSend: string | null,
  timeoutMs = 2000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (getRefreshToken() !== refreshTokenAtSend && getAccessToken()) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return false
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isPublicPath(error.config?.url, error.config?.method)
    ) {
      const original = error.config as (AxiosRequestConfig & {
        _retry?: boolean
      }) | undefined
      if (original && !original._retry) {
        original._retry = true

        if (!getAccessToken() && !getRefreshToken()) {
          return reject(error)
        }

        const refreshTokenAtSend = getRefreshToken()

        if (await refreshOnce()) {
          // The request interceptor attaches the freshly minted access token.
          return api.request(original)
        }

        if (await waitForOutOfBandRefresh(refreshTokenAtSend)) {
          return api.request(original)
        }

        expireSession()
      }
    }
    return reject(error)
  },
)

function reject(error: unknown): Promise<never> {
  if (axios.isAxiosError(error)) {
    const envelope = error.response?.data as ApiEnvelope<unknown> | undefined
    error.message = envelope?.message ?? error.message
  }
  return Promise.reject(error)
}

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data
}
