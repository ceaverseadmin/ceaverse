import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  clearCachedUser,
  fetchMe,
  getAccessToken,
  getCachedUser,
  login as apiLogin,
  logout as apiLogout,
  setCachedUser,
} from '../lib/auth'
import type { AuthUser } from '../lib/auth'
import { AuthContext } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialUser = getAccessToken() ? getCachedUser() : null
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [loading, setLoading] = useState(Boolean(getAccessToken()) && !initialUser)

  useEffect(() => {
    if (!getAccessToken()) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false

    fetchMe()
      .then((nextUser) => {
        if (cancelled || !getAccessToken()) return
        setUser(nextUser)
        setCachedUser(nextUser)
      })
      .catch(() => {
        if (cancelled) return
        clearCachedUser()
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      clearCachedUser()
      setUser(null)
    }
    window.addEventListener('ea:session-expired', handleSessionExpired)
    return () => window.removeEventListener('ea:session-expired', handleSessionExpired)
  }, [])

  const login = async (email: string, password: string) => {
    const tokens = await apiLogin(email, password)
    setCachedUser(tokens.user)
    setUser(tokens.user)
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAdmin: Boolean(user && (user.role === 'admin' || user.role === 'super_admin')),
    isSuperAdmin: user?.role === 'super_admin',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
