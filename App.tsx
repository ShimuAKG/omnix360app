import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { theme } from './src/theme'
import type { AppStackParams, AuthStackParams } from './src/navigation'
import LoginScreen from './src/screens/LoginScreen'
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen'
import ConversasScreen from './src/screens/ConversasScreen'
import ChatScreen from './src/screens/ChatScreen'
import NovaConversaScreen from './src/screens/NovaConversaScreen'

const AuthStack = createNativeStackNavigator<AuthStackParams>()
const AppStack = createNativeStackNavigator<AppStackParams>()

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.bg,
    card: theme.bgDeep,
    text: theme.text,
    border: theme.border,
    primary: theme.purpleNeon,
  },
}

const headerStyle = {
  headerStyle: { backgroundColor: theme.bgDeep },
  headerTintColor: theme.text,
  headerTitleStyle: { color: theme.text },
}

function Rotas() {
  const { user, booting } = useAuth()

  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.purpleNeon} />
      </View>
    )
  }

  return user ? (
    <AppStack.Navigator screenOptions={headerStyle}>
      <AppStack.Screen name="Conversas" component={ConversasScreen} options={{ title: 'Atendimento' }} />
      <AppStack.Screen name="Chat" component={ChatScreen} />
      <AppStack.Screen name="NovaConversa" component={NovaConversaScreen} options={{ title: 'Nova conversa' }} />
    </AppStack.Navigator>
  ) : (
    <AuthStack.Navigator screenOptions={headerStyle}>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen
        name="EsqueciSenha"
        component={ForgotPasswordScreen}
        options={{ title: '', headerTransparent: true }}
      />
    </AuthStack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Rotas />
      </NavigationContainer>
    </AuthProvider>
  )
}
