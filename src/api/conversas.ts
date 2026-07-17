import { apiFetch } from './client'

export type Conversa = {
  id: number
  contato_nome?: string
  contato_telefone?: string
  canal_tipo?: string
  status?: string
  ultima_mensagem?: string
  nao_lidas?: number
  departamento_id?: number
  agente_id?: number | null
  atualizado_em?: string
}

export const listarConversas = () => apiFetch<Conversa[]>('/conversas')
export const getConversa = (id: number) => apiFetch<Conversa>(`/conversas/${id}`)
export const assumirConversa = (id: number) =>
  apiFetch(`/conversas/${id}/assumir`, { method: 'PATCH' })
export const encerrarConversa = (id: number) =>
  apiFetch(`/conversas/${id}/encerrar`, { method: 'PATCH' })
