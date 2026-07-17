# OmniX360 (app mobile de atendimento)

App nativo (iOS/Android) contendo **apenas o módulo de Atendimento** do OmniX360.
Usa a mesma autenticação e a mesma segregação por função da plataforma web
(tudo validado no backend). Stack: **Expo + React Native + TypeScript**.

Documento do projeto: `omnix360:/ommnedocs/projeto-app-mobile-atendimento.md`.

## Requisitos
- Node 18+ e npm.
- Conta **Expo** grátis (https://expo.dev) para gerar builds (APK) na nuvem via EAS.
- (iOS, futuro) Apple Developer Program. (Play Store, futuro) Google Play Console.

## Configuração
- Base da API em `src/config.ts` (`API_BASE_URL`, padrão `https://builder.omnix360.com.br`).

## Rodar em desenvolvimento
```bash
npm install
npx expo start        # abre o Metro; use o app Expo Go ou um dev build
```

## Gerar APK (Android, gratuito)
```bash
npm i -g eas-cli
eas login             # conta Expo
eas build -p android --profile preview   # gera um .apk instalável (nuvem)
```
O `.apk` sai por um link do Expo; instale direto no aparelho (sideload).

## Estrutura
```
App.tsx                 # navegação (auth stack x app stack)
src/config.ts           # base da API
src/theme.ts            # paleta da marca
src/lib/secureStore.ts  # tokens em Keychain/Keystore
src/lib/socket.ts       # socket.io-client (auth por token)
src/api/client.ts       # fetch autenticado + auto-refresh (401)
src/api/auth.ts         # login-mobile, refresh, logout, esqueci-senha, me
src/api/conversas.ts    # lista/abre/assume/encerra conversas
src/api/mensagens.ts    # histórico, enviar, marcar lidas
src/context/AuthContext.tsx  # sessão, boot, login/logout
src/screens/            # Login, EsqueciSenha, Conversas, Chat
```

## Status (fases)
- [x] **Fase 0 (backend)**: login-mobile + refresh token + push_devices (no OmniX360).
- [x] **Fase 1 (auth)**: login, esqueci senha, storage seguro, sessão com refresh, boot.
- [x] **Fase 2/3 (base)**: lista de conversas e chat (envio/recebimento ao vivo via socket).
- [ ] **Biometria** opcional (expo-local-authentication) para desbloquear a sessão.
- [ ] **Push (FCM)**: registrar device (`POST /api/push/register`) + disparo no backend.
- [ ] **Upload de mídia/áudio** no chat.
- [ ] Confirmar o **contrato exato** de `POST /api/mensagens` (corpo) com o backend.

## Notas
- Nenhum segredo embarcado no app; a autenticação é server-side.
- iOS e Play Store usam o mesmo código (sem retrabalho) quando forem ativados.
