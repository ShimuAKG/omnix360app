import { Platform } from 'react-native'
import { API_URL } from '../config'
import { clearSession, getRefreshToken, saveSession, type SessionUser } from '../lib/secureStore'
import { apiFetch } from './client'

// Login do app → recebe access + refresh no corpo e persiste em storage seguro.
export async function loginMobile(email: string, password: string): Promise<SessionUser> {
  const res = await fetch(`${API_URL}/auth/login-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, device: `${Platform.OS} app` }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'E-mail ou senha incorretos.')
  await saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user)
  return data.user as SessionUser
}

// Esqueci minha senha (reusa o fluxo já existente da plataforma).
export async function esqueciSenha(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/esqueci-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.message || 'Não foi possível enviar o e-mail.')
  }
}

export async function logoutMobile(): Promise<void> {
  const rt = await getRefreshToken()
  try {
    await fetch(`${API_URL}/auth/logout-mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    })
  } catch {
    /* ignore */
  }
  await clearSession()
}

// Valida a sessão no boot do app (usa Bearer via apiFetch).
export async function me(): Promise<{ user: SessionUser & { agente_id: number | null } }> {
  return apiFetch('/auth/me')
}
