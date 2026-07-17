import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { esqueciSenha } from '../api/auth'
import { theme } from '../theme'
import type { AuthStackParams } from '../navigation'

export default function ForgotPasswordScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'EsqueciSenha'>) {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function onEnviar() {
    setErro('')
    setMsg('')
    setCarregando(true)
    try {
      await esqueciSenha(email.trim())
      setMsg('Se o e-mail existir, enviamos um link para redefinir a senha.')
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esqueci minha senha</Text>
      <Text style={styles.desc}>
        Informe seu e-mail. Enviaremos um link para você criar uma nova senha.
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="voce@empresa.com"
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />

      {!!msg && <Text style={styles.ok}>{msg}</Text>}
      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      <Pressable
        style={[styles.btn, (!email.trim() || carregando) && styles.btnOff]}
        onPress={onEnviar}
        disabled={!email.trim() || carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnTxt}>Enviar link</Text>
        )}
      </Pressable>

      <Pressable style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backTxt}>Voltar ao login</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: 'center' },
  title: { color: theme.text, fontSize: 24, fontWeight: '800' },
  desc: { color: theme.textDim, fontSize: 14, marginTop: 8, marginBottom: 22, lineHeight: 20 },
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
  ok: { color: theme.online, fontSize: 13, marginTop: 14 },
  erro: { color: theme.danger, fontSize: 13, marginTop: 14 },
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
  back: { marginTop: 16, alignItems: 'center' },
  backTxt: { color: theme.textDim, fontSize: 14 },
})
