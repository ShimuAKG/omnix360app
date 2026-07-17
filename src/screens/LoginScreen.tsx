import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { theme } from '../theme'
import type { AuthStackParams } from '../navigation'

export default function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParams, 'Login'>) {
  const { entrar } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function onEntrar() {
    setErro('')
    setCarregando(true)
    try {
      await entrar(email.trim(), senha)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  const podeEntrar = email.trim().length > 0 && senha.length > 0 && !carregando

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.brand}>
        <Text style={styles.logo}>
          OMNI<Text style={{ color: theme.purpleNeon }}>X360</Text>
        </Text>
        <Text style={styles.sub}>Atendimento</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
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

        <Text style={[styles.label, { marginTop: 14 }]}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
        />

        {!!erro && <Text style={styles.erro}>{erro}</Text>}

        <Pressable
          style={[styles.btn, !podeEntrar && styles.btnOff]}
          onPress={onEntrar}
          disabled={!podeEntrar}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTxt}>Acessar</Text>
          )}
        </Pressable>

        <Pressable style={styles.forgot} onPress={() => navigation.navigate('EsqueciSenha')}>
          <Text style={styles.forgotTxt}>Esqueci minha senha</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 36 },
  logo: { color: theme.text, fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  sub: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
  },
  label: { color: theme.textDim, fontSize: 13, fontWeight: '600', marginBottom: 6 },
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
  forgot: { marginTop: 16, alignItems: 'center' },
  forgotTxt: { color: theme.textDim, fontSize: 14 },
})
