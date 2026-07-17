import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listarMensagens, enviarMensagem, marcarLidas, type Mensagem } from '../api/mensagens'
import { getSocket } from '../lib/socket'
import { theme } from '../theme'
import type { AppStackParams } from '../navigation'

function ehSaida(m: Mensagem) {
  return m.direcao === 'saida'
}
function textoDe(m: Mensagem) {
  return m.conteudo ?? m.texto ?? ''
}

export default function ChatScreen({ route, navigation }: NativeStackScreenProps<AppStackParams, 'Chat'>) {
  const { conversaId, titulo } = route.params
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const listRef = useRef<FlatList<Mensagem>>(null)

  useLayoutEffect(() => {
    navigation.setOptions({ title: titulo })
  }, [navigation, titulo])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await listarMensagens(conversaId)
        setMensagens(Array.isArray(data) ? data : [])
        marcarLidas(conversaId).catch(() => {})
      } finally {
        setCarregando(false)
      }
    })()
  }, [conversaId])

  // Recebe novas mensagens ao vivo.
  useEffect(() => {
    const s = getSocket()
    if (!s) return
    const onNova = (m: Mensagem) => {
      if (Number(m?.conversa_id) === Number(conversaId)) {
        setMensagens((prev) => [...prev, m])
        marcarLidas(conversaId).catch(() => {})
      }
    }
    s.on('nova_mensagem', onNova)
    return () => {
      s.off('nova_mensagem', onNova)
    }
  }, [conversaId])

  async function onEnviar() {
    const t = texto.trim()
    if (!t || enviando) return
    setEnviando(true)
    setTexto('')
    try {
      const nova = await enviarMensagem(conversaId, t)
      setMensagens((prev) => [...prev, nova])
    } catch {
      setTexto(t) // devolve o texto em caso de erro
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.purpleNeon} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={mensagens}
        keyExtractor={(m, i) => String(m.id ?? i)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[styles.bolha, ehSaida(item) ? styles.saida : styles.entrada]}>
            <Text style={styles.msgTxt}>{textoDe(item)}</Text>
          </View>
        )}
      />

      <View style={styles.barra}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Mensagem..."
          placeholderTextColor={theme.textMuted}
          multiline
        />
        <Pressable
          style={[styles.send, (!texto.trim() || enviando) && styles.sendOff]}
          onPress={onEnviar}
          disabled={!texto.trim() || enviando}
        >
          <Text style={styles.sendTxt}>{enviando ? '...' : 'Enviar'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
  bolha: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  entrada: { alignSelf: 'flex-start', backgroundColor: theme.surface },
  saida: { alignSelf: 'flex-end', backgroundColor: theme.purple },
  msgTxt: { color: theme.text, fontSize: 15, lineHeight: 20 },
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.bgDeep,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  send: {
    backgroundColor: theme.purple,
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: { opacity: 0.5 },
  sendTxt: { color: '#fff', fontWeight: '700' },
})
