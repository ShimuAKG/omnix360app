import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  iniciarConversa,
  listarDepartamentos,
  type Departamento,
} from '../api/conversas'
import { theme } from '../theme'
import type { AppStackParams } from '../navigation'

type Tipo = 'whatsapp' | 'email'

export default function NovaConversaScreen({
  navigation,
}: NativeStackScreenProps<AppStackParams, 'NovaConversa'>) {
  const [deps, setDeps] = useState<Departamento[]>([])
  const [depId, setDepId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<Tipo>('whatsapp')
  const [contato, setContato] = useState('') // telefone ou e-mail
  const [nome, setNome] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarDepartamentos()
      .then((d) => {
        setDeps(d)
        if (d.length === 1) setDepId(d[0].id)
      })
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [])

  const podeEnviar =
    !!depId && contato.trim().length > 0 && mensagem.trim().length > 0 && !enviando

  async function onEnviar() {
    if (!depId) return
    setErro('')
    setEnviando(true)
    try {
      const r =
        tipo === 'email'
          ? await iniciarConversa({
              tipo: 'email',
              departamento_id: depId,
              email_destino: contato.trim(),
              nome_contato: nome.trim() || undefined,
              assunto: assunto.trim() || undefined,
              mensagem_inicial: mensagem.trim(),
            })
          : await iniciarConversa({
              tipo: 'whatsapp',
              departamento_id: depId,
              telefone: contato.trim(),
              nome_contato: nome.trim() || undefined,
              mensagem_inicial: mensagem.trim(),
            })

      const id =
        (r?.id as number) ??
        (r?.conversa_id as number) ??
        ((r?.conversa as { id?: number })?.id as number)
      if (id) {
        navigation.replace('Chat', { conversaId: Number(id), titulo: nome.trim() || contato.trim() })
      } else {
        navigation.goBack()
      }
    } catch (e) {
      setErro((e as Error).message)
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
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 4 }} keyboardShouldPersistTaps="handled">
        {/* Canal */}
        <Text style={styles.label}>Canal</Text>
        <View style={styles.segment}>
          {(['whatsapp', 'email'] as Tipo[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.segBtn, tipo === t && styles.segBtnOn]}
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.segTxt, tipo === t && styles.segTxtOn]}>
                {t === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Departamento */}
        <Text style={[styles.label, { marginTop: 16 }]}>Departamento</Text>
        <View style={styles.chips}>
          {deps.map((d) => (
            <Pressable
              key={d.id}
              style={[styles.chip, depId === d.id && styles.chipOn]}
              onPress={() => setDepId(d.id)}
            >
              <Text style={[styles.chipTxt, depId === d.id && styles.chipTxtOn]}>{d.nome}</Text>
            </Pressable>
          ))}
          {deps.length === 0 && <Text style={styles.hint}>Nenhum departamento disponível.</Text>}
        </View>

        {/* Contato */}
        <Text style={[styles.label, { marginTop: 16 }]}>
          {tipo === 'email' ? 'E-mail do contato' : 'Telefone (com DDD)'}
        </Text>
        <TextInput
          style={styles.input}
          value={contato}
          onChangeText={setContato}
          placeholder={tipo === 'email' ? 'cliente@email.com' : '5541999999999'}
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          keyboardType={tipo === 'email' ? 'email-address' : 'phone-pad'}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Nome do contato (opcional)</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome"
          placeholderTextColor={theme.textMuted}
        />

        {tipo === 'email' && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Assunto</Text>
            <TextInput
              style={styles.input}
              value={assunto}
              onChangeText={setAssunto}
              placeholder="Assunto do e-mail"
              placeholderTextColor={theme.textMuted}
            />
          </>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Mensagem</Text>
        <TextInput
          style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
          value={mensagem}
          onChangeText={setMensagem}
          placeholder="Escreva a primeira mensagem..."
          placeholderTextColor={theme.textMuted}
          multiline
        />

        {!!erro && <Text style={styles.erro}>{erro}</Text>}

        <Pressable
          style={[styles.btn, !podeEnviar && styles.btnOff]}
          onPress={onEnviar}
          disabled={!podeEnviar}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTxt}>Iniciar conversa</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
  label: { color: theme.textDim, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  hint: { color: theme.textMuted, fontSize: 13 },
  segment: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  segBtnOn: { backgroundColor: theme.purple, borderColor: theme.purple },
  segTxt: { color: theme.textDim, fontWeight: '600' },
  segTxtOn: { color: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  chipOn: { backgroundColor: theme.purple, borderColor: theme.purple },
  chipTxt: { color: theme.textDim, fontSize: 13, fontWeight: '500' },
  chipTxtOn: { color: '#fff' },
  input: {
    backgroundColor: theme.bgDeep,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  erro: { color: theme.danger, fontSize: 13, marginTop: 12 },
  btn: {
    marginTop: 20,
    backgroundColor: theme.purple,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOff: { opacity: 0.5 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
