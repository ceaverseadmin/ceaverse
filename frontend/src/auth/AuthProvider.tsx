import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchMe, login as apiLogin, logout as apiLogout } from '../lib/auth'
import type { AuthUser } from '../lib/auth'
import { AuthContext } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const tokens = await apiLogin(email, password)
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
