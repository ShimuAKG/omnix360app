import { apiFetch } from './client'

// Espelha a tabela `mensagens` do backend (routes/mensagens.js):
// origem 'agente' = enviada pelo atendente (saída); demais = entrada do contato.
export type Mensagem = {
  id: number
  conversa_id: number
  conteudo?: string
  origem?: string
  tipo?: string
  status_envio?: string
  enviado_em?: string
  agente_id?: number | null
}

export const listarMensagens = (conversaId: number) =>
  apiFetch<Mensagem[]>(`/mensagens/${conversaId}`)

// Contrato confirmado no backend: { conversa_id, conteudo, tipo }.
export const enviarMensagem = (conversaId: number, conteudo: string) =>
  apiFetch<Mensagem>('/mensagens', {
    method: 'POST',
    body: JSON.stringify({ conversa_id: conversaId, conteudo, tipo: 'texto' }),
  })

export const marcarLidas = (conversaId: number) =>
  apiFetch(`/mensagens/marcar-lidas/${conversaId}`, { method: 'POST' })
