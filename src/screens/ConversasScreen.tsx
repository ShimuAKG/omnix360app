import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listarConversas, type Conversa } from '../api/conversas'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../lib/socket'
import { theme } from '../theme'
import type { AppStackParams } from '../navigation'

export default function ConversasScreen({
  navigation,
}: NativeStackScreenProps<AppStackParams, 'Conversas'>) {
  const { sair } = useAuth()
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      setErro('')
      const data = await listarConversas()
      setConversas(Array.isArray(data) ? data : [])
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Atualiza a lista ao vivo com eventos do socket.
  useEffect(() => {
    const s = getSocket()
    if (!s) return
    const recarregar = () => carregar()
    const eventos = [
      'nova_conversa',
      'nova_mensagem',
      'conversa_atribuida',
      'conversa_assumida',
      'conversa_transferida',
      'conversa_encerrada',
      'conversa_reaberta',
    ]
    eventos.forEach((ev) => s.on(ev, recarregar))
    return () => eventos.forEach((ev) => s.off(ev, recarregar))
  }, [carregar])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={sair} hitSlop={10}>
          <Text style={{ color: theme.textDim, fontSize: 14 }}>Sair</Text>
        </Pressable>
      ),
    })
  }, [navigation, sair])

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.purpleNeon} />
      </View>
    )
  }

  return (
    <FlatList
      style={styles.list}
      data={conversas}
      keyExtractor={(c) => String(c.id)}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={carregar} tintColor={theme.purpleNeon} />
      }
      ListEmptyComponent={
        <Text style={styles.vazio}>{erro || 'Nenhuma conversa por aqui.'}</Text>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.item}
          onPress={() =>
            navigation.navigate('Chat', {
              conversaId: item.id,
              titulo: item.contato_nome || item.contato_telefone || `Conversa ${item.id}`,
            })
          }
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {(item.contato_nome || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome} numberOfLines={1}>
              {item.contato_nome || item.contato_telefone || `Conversa ${item.id}`}
            </Text>
            <Text style={styles.previa} numberOfLines={1}>
              {item.ultima_mensagem || '—'}
            </Text>
          </View>
          {!!item.nao_lidas && item.nao_lidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{item.nao_lidas}</Text>
            </View>
          )}
        </Pressable>
      )}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1, backgroundColor: theme.bg },
  vazio: { color: theme.textMuted, textAlign: 'center', marginTop: 60, paddingHorizontal: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  nome: { color: theme.text, fontSize: 15, fontWeight: '600' },
  previa: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTxt: { color: theme.bgDeep, fontSize: 12, fontWeight: '800' },
})
