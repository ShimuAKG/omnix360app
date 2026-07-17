import { API_URL } from '../config'
import { clearSession, getAccessToken, getRefreshToken, saveSession } from '../lib/secureStore'

// Callback chamado quando a sessão expira de vez (refresh falhou) → volta ao login.
let onLogout: (() => void) | null = null
export function setOnLogout(fn: (() => void) | null) {
  onLogout = fn
}

// Evita disparar vários refresh em paralelo.
let refreshing: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const rt = await getRefreshToken()
  if (!rt) return null
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })
  if (!res.ok) return null
  const data = await res.json()
  await saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data.accessToken as string
}

// Fetch autenticado com Bearer + auto-refresh (1 retry) em 401.
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  _retry = false,
): Promise<T> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401 && !_retry) {
    if (!refreshing) refreshing = doRefresh().finally(() => (refreshing = null))
    const novo = await refreshing
    if (novo) return apiFetch<T>(path, options, true)
    await clearSession()
    onLogout?.()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!res.ok) {
    let msg = 'Erro na requisição.'
    try {
      const j = await res.json()
      msg = j.message || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
