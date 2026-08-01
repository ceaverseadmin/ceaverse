import { createContext } from 'react'
import type { AuthUser } from '../lib/auth'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
