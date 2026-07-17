import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  listarMensagens,
  enviarMensagem,
  enviarArquivo,
  marcarLidas,
  midiaUrl,
  nomeDocumento,
  type ArquivoUpload,
  type Mensagem,
} from '../api/mensagens'
import { getSocket } from '../lib/socket'
import { theme } from '../theme'
import type { AppStackParams } from '../navigation'

function ehSaida(m: Mensagem) {
  return m.origem === 'agente'
}
function textoDe(m: Mensagem) {
  return m.conteudo ?? ''
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

  async function anexar(file: ArquivoUpload) {
    setEnviando(true)
    try {
      const nova = await enviarArquivo(conversaId, file)
      setMensagens((prev) => [...prev, nova])
    } catch (e) {
      Alert.alert('Anexo', (e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  async function escolherFoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão', 'Permita o acesso às fotos para anexar imagens.')
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (res.canceled || !res.assets?.[0]) return
    const a = res.assets[0]
    const ext = a.mimeType?.includes('png') ? '.png' : a.mimeType?.includes('webp') ? '.webp' : '.jpg'
    await anexar({ uri: a.uri, name: a.fileName || `foto${ext}`, type: a.mimeType || 'image/jpeg' })
  }

  async function escolherDocumento() {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      copyToCacheDirectory: true,
    })
    if (res.canceled || !res.assets?.[0]) return
    const a = res.assets[0]
    await anexar({ uri: a.uri, name: a.name, type: a.mimeType || 'application/octet-stream' })
  }

  function abrirAnexoMenu() {
    Alert.alert('Anexar', undefined, [
      { text: 'Foto', onPress: escolherFoto },
      { text: 'Documento', onPress: escolherDocumento },
      { text: 'Cancelar', style: 'cancel' },
    ])
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
            {item.tipo === 'imagem' ? (
              <Pressable onPress={() => Linking.openURL(midiaUrl(item.conteudo))}>
                <Image source={{ uri: midiaUrl(item.conteudo) }} style={styles.imagem} resizeMode="cover" />
              </Pressable>
            ) : item.tipo === 'documento' ? (
              <Pressable style={styles.doc} onPress={() => Linking.openURL(midiaUrl(item.conteudo))}>
                <Text style={styles.docIcon}>📄</Text>
                <Text style={styles.docTxt} numberOfLines={1}>{nomeDocumento(item.conteudo)}</Text>
              </Pressable>
            ) : item.tipo === 'audio' ? (
              <Pressable style={styles.doc} onPress={() => Linking.openURL(midiaUrl(item.conteudo))}>
                <Text style={styles.docIcon}>▶︎</Text>
                <Text style={styles.docTxt}>Áudio</Text>
              </Pressable>
            ) : (
              <Text style={styles.msgTxt}>{textoDe(item)}</Text>
            )}
          </View>
        )}
      />

      <View style={styles.barra}>
        <Pressable style={styles.clip} onPress={abrirAnexoMenu} disabled={enviando}>
          <Text style={styles.clipTxt}>+</Text>
        </Pressable>
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
  imagem: { width: 200, height: 200, borderRadius: 10 },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  docIcon: { fontSize: 18 },
  docTxt: { color: theme.text, fontSize: 14, maxWidth: 180 },
  clip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  clipTxt: { color: theme.textDim, fontSize: 24, fontWeight: '700', marginTop: -2 },
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
