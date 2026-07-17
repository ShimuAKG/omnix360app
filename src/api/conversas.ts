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

export type Departamento = { id: number; nome: string }

export const listarDepartamentos = () =>
  apiFetch<{ departamentos: Departamento[] }>('/conversas/departamentos-visiveis').then(
    (r) => r.departamentos || [],
  )

// Inicia uma conversa (outbound), igual ao módulo web. canal_id é opcional
// (o backend usa o canal padrão do departamento).
export type NovaConversaInput =
  | {
      tipo: 'whatsapp'
      departamento_id: number
      telefone: string
      nome_contato?: string
      mensagem_inicial: string
    }
  | {
      tipo: 'email'
      departamento_id: number
      email_destino: string
      nome_contato?: string
      assunto?: string
      mensagem_inicial: string
    }

export function iniciarConversa(input: NovaConversaInput) {
  const body =
    input.tipo === 'email'
      ? {
          modo: 'email',
          departamento_id: input.departamento_id,
          email_destino: input.email_destino,
          nome_contato: input.nome_contato,
          assunto: input.assunto,
          mensagem_inicial: input.mensagem_inicial,
        }
      : {
          departamento_id: input.departamento_id,
          telefone: input.telefone,
          nome_contato: input.nome_contato,
          mensagem_inicial: input.mensagem_inicial,
        }
  return apiFetch<Record<string, unknown>>('/conversas/nova', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const listarConversas = () => apiFetch<Conversa[]>('/conversas')
export const getConversa = (id: number) => apiFetch<Conversa>(`/conversas/${id}`)
export const assumirConversa = (id: number) =>
  apiFetch(`/conversas/${id}/assumir`, { method: 'PATCH' })
export const encerrarConversa = (id: number) =>
  apiFetch(`/conversas/${id}/encerrar`, { method: 'PATCH' })
