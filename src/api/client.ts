import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../auth/tokens'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const accessToken = getAccessToken()
  const headers = new Headers(init?.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(input, { ...init, headers })
  if (res.status !== 401) return res

  // 401 — attempt token refresh
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    window.dispatchEvent(new Event('auth:logout'))
    return res
  }

  const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!refreshRes.ok) {
    clearTokens()
    window.dispatchEvent(new Event('auth:logout'))
    return res
  }

  const data = await refreshRes.json()
  setTokens(data.access_token, data.refresh_token)

  // Retry original request once with the new access token
  const retryHeaders = new Headers(init?.headers)
  retryHeaders.set('Authorization', `Bearer ${data.access_token}`)
  return fetch(input, { ...init, headers: retryHeaders })
}
