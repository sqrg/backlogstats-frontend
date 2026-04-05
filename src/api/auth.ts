import { BASE_URL } from './client'

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Login failed: ${res.status}`)
  }
  return res.json()
}

export async function apiRegister(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Registration failed: ${res.status}`)
  }
  return res.json()
}

export async function apiRefresh(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`)
  }
  return res.json()
}

export async function apiGoogleAuth(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Google sign-in failed: ${res.status}`)
  }
  return res.json()
}

export async function apiDiscordAuth(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/discord`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Discord sign-in failed: ${res.status}`)
  }
  return res.json()
}
