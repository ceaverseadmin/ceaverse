import { api, unwrap } from './api'
import type { ApiEnvelope } from './types'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
  user: AuthUser
}

const ACCESS_KEY = 'ea_access'
const REFRESH_KEY = 'ea_refresh'
const USER_KEY = 'ea_user'
const ADMIN_ROLES = new Set(['admin', 'super_admin'])

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getCachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser> | null
    if (
      !parsed ||
      typeof parsed.id !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.role !== 'string' ||
      ADMIN_ROLES.has(parsed.role)
    ) {
      localStorage.removeItem(USER_KEY)
      return null
    }
    return parsed as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function setCachedUser(user: AuthUser): void {
  if (ADMIN_ROLES.has(user.role)) {
    clearCachedUser()
    return
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearCachedUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: { access: string; refresh: string }): void {
  localStorage.setItem(ACCESS_KEY, tokens.access)
  localStorage.setItem(REFRESH_KEY, tokens.refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  clearCachedUser()
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<ApiEnvelope<AuthTokens>>('/auth/login/', {
    email,
    password,
  })
  setTokens({ access: data.data.access, refresh: data.data.refresh })
  return data.data
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken()
  try {
    if (refresh) {
      await api.post('/auth/logout/', { refresh })
    }
  } finally {
    clearTokens()
  }
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<ApiEnvelope<AuthUser>>('/auth/me/')
  return data.data
}

export async function refreshAccessToken(): Promise<AuthTokens | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  const { data } = await api.post<ApiEnvelope<AuthTokens>>('/auth/refresh/', {
    refresh,
  })
  setTokens({ access: data.data.access, refresh: data.data.refresh })
  return data.data
}

export async function signup(
  email: string,
  full_name: string,
  password: string,
  password_confirm: string,
): Promise<AuthUser> {
  const { data } = await api.post<ApiEnvelope<AuthUser>>('/auth/signup/', {
    email,
    full_name,
    password,
    password_confirm,
  })
  return data.data
}

export async function updateProfile(data: {
  full_name?: string
  password?: string
}): Promise<AuthUser> {
  const response = await api.patch<ApiEnvelope<AuthUser>>('/auth/me/', data)
  return unwrap(response.data)
}
