import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loginMobile, logoutMobile, me } from '../api/auth'
import { setOnLogout } from '../api/client'
import { getAccessToken, type SessionUser } from '../lib/secureStore'
import { desregistrarPush, registrarPush } from '../lib/push'
import { connectSocket, disconnectSocket } from '../lib/socket'

type AuthState = {
  user: SessionUser | null
  booting: boolean
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [booting, setBooting] = useState(true)

  // Boot: se há token guardado, valida no /me e conecta o socket.
  useEffect(() => {
    setOnLogout(() => {
      disconnectSocket()
      setUser(null)
    })
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (token) {
          const { user: u } = await me()
          setUser(u)
          await connectSocket()
          registrarPush()
        }
      } catch {
        setUser(null)
      } finally {
        setBooting(false)
      }
    })()
    return () => setOnLogout(null)
  }, [])

  async function entrar(email: string, senha: string) {
    const u = await loginMobile(email, senha)
    setUser(u)
    await connectSocket()
    registrarPush()
  }

  async function sair() {
    await desregistrarPush()
    await logoutMobile()
    disconnectSocket()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, booting, entrar, sair }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
