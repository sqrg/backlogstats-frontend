import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './tokens'
import { apiLogin, apiRegister, apiRefresh } from '../api/auth'
import { fetchMe } from '../api/users'
import type { UserRead } from '../types/user'

interface AuthUser {
  id: number
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  profile: UserRead | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithTokens: (access: string, refresh: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

interface JWTPayload {
  sub: string | number
  email: string
  exp: number
}

function decodeUser(token: string): AuthUser | null {
  try {
    const payload = jwtDecode<JWTPayload>(token)
    if (payload.exp * 1000 < Date.now()) return null
    return { id: Number(payload.sub), email: payload.email }
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserRead | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  function logout(): void {
    clearTokens()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchMe()
      setProfile(data)
    } catch {
      // silently ignore — profile is a nice-to-have on top of JWT auth
    }
  }, [])

  useEffect(() => {
    async function initAuth() {
      const accessToken = getAccessToken()
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      const decoded = decodeUser(accessToken)
      if (decoded) {
        setUser(decoded)
        // fetch full profile in the background — don't block auth init
        fetchMe().then(setProfile).catch(() => undefined)
        setIsLoading(false)
        return
      }

      // Token expired — attempt silent refresh
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        setIsLoading(false)
        return
      }

      try {
        const data = await apiRefresh(refreshToken)
        setTokens(data.access_token, data.refresh_token)
        const u = decodeUser(data.access_token)
        setUser(u)
        if (u) fetchMe().then(setProfile).catch(() => undefined)
      } catch {
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Listen for forced logout dispatched by apiFetch on refresh failure
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const data = await apiLogin(email, password)
    setTokens(data.access_token, data.refresh_token)
    setUser(decodeUser(data.access_token))
    fetchMe().then(setProfile).catch(() => undefined)
  }

  async function register(email: string, password: string): Promise<void> {
    const data = await apiRegister(email, password)
    setTokens(data.access_token, data.refresh_token)
    setUser(decodeUser(data.access_token))
    fetchMe().then(setProfile).catch(() => undefined)
  }

  async function loginWithTokens(access: string, refresh: string): Promise<void> {
    setTokens(access, refresh)
    setUser(decodeUser(access))
    fetchMe().then(setProfile).catch(() => undefined)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, register, loginWithTokens, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
