import { io, type Socket } from 'socket.io-client'
import { SOCKET_URL } from '../config'
import { getAccessToken } from './secureStore'

let socket: Socket | null = null

// Conecta ao Socket.io do OmniX360 passando o access token no handshake
// (mesmo mecanismo que o backend já aceita: socket.handshake.auth.token).
export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket
  const token = await getAccessToken()
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
  })
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
