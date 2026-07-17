// Tipos das rotas de navegação (stacks de auth e do app).
export type AuthStackParams = {
  Login: undefined
  EsqueciSenha: undefined
}

export type AppStackParams = {
  Conversas: undefined
  Chat: { conversaId: number; titulo: string }
}
