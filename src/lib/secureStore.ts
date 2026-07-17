import * as SecureStore from 'expo-secure-store'

// Guarda tokens e usuário em armazenamento seguro (Keychain iOS / Keystore Android).
const K_ACCESS = 'omnix_access'
const K_REFRESH = 'omnix_refresh'
const K_USER = 'omnix_user'

export type SessionUser = {
  login: string
  nome: string
  email: string
  nivel: string
  grupo?: string
}

export async function saveSession(
  tokens: { accessToken: string; refreshToken: string },
  user?: SessionUser,
) {
  await SecureStore.setItemAsync(K_ACCESS, tokens.accessToken)
  await SecureStore.setItemAsync(K_REFRESH, tokens.refreshToken)
  if (user) await SecureStore.setItemAsync(K_USER, JSON.stringify(user))
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(K_ACCESS)
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(K_REFRESH)
}

export async function getStoredUser(): Promise<SessionUser | null> {
  const raw = await SecureStore.getItemAsync(K_USER)
  return raw ? (JSON.parse(raw) as SessionUser) : null
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(K_ACCESS)
  await SecureStore.deleteItemAsync(K_REFRESH)
  await SecureStore.deleteItemAsync(K_USER)
}
