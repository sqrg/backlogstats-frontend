import {
  createContext,
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

interface AuthUser {
  id: number
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithTokens: (access: string, refresh: string) => Promise<void>
  logout: () => void
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
  const [isLoading, setIsLoading] = useState(true)

  function logout(): void {
    clearTokens()
    setUser(null)
  }

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
        setUser(decodeUser(data.access_token))
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
  }

  async function register(email: string, password: string): Promise<void> {
    const data = await apiRegister(email, password)
    setTokens(data.access_token, data.refresh_token)
    setUser(decodeUser(data.access_token))
  }

  async function loginWithTokens(access: string, refresh: string): Promise<void> {
    setTokens(access, refresh)
    setUser(decodeUser(access))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithTokens, logout }}>
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
