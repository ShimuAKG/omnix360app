import { apiFetch } from './client'

export type Mensagem = {
  id: number
  conversa_id: number
  conteudo?: string
  texto?: string
  direcao?: 'entrada' | 'saida'
  autor?: string
  status?: string
  criado_em?: string
  tipo?: string
}

export const listarMensagens = (conversaId: number) =>
  apiFetch<Mensagem[]>(`/mensagens/${conversaId}`)

// NOTA: confirmar o shape exato do corpo com o backend (routes/mensagens.js).
// Mantido genérico para o MVP; ajustar quando validarmos o contrato.
export const enviarMensagem = (conversaId: number, texto: string) =>
  apiFetch<Mensagem>('/mensagens', {
    method: 'POST',
    body: JSON.stringify({ conversa_id: conversaId, texto, conteudo: texto }),
  })

export const marcarLidas = (conversaId: number) =>
  apiFetch(`/mensagens/marcar-lidas/${conversaId}`, { method: 'POST' })
