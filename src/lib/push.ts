import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { apiFetch } from '../api/client'

// Mostra a notificação mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

let tokenAtual: string | null = null

// Pede permissão, obtém o ExponentPushToken e registra no backend.
// Best-effort: qualquer falha é silenciosa (ex.: FCM ainda não configurado).
export async function registrarPush(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Atendimento',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      })
    }

    let { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status
    }
    if (status !== 'granted') return

    // Token NATIVO do device (FCM no Android) — o backend envia direto via FCM.
    const resp = await Notifications.getDevicePushTokenAsync()
    tokenAtual = resp.data as string

    await apiFetch('/push/register', {
      method: 'POST',
      body: JSON.stringify({ token: tokenAtual, plataforma: Platform.OS }),
    })
  } catch {
    /* push é best-effort; não quebra o app */
  }
}

export async function desregistrarPush(): Promise<void> {
  if (!tokenAtual) return
  try {
    await apiFetch('/push/unregister', {
      method: 'POST',
      body: JSON.stringify({ token: tokenAtual }),
    })
  } catch {
    /* ignore */
  }
  tokenAtual = null
}
