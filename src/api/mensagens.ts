import { API_BASE_URL, API_URL } from '../config'
import { getAccessToken } from '../lib/secureStore'
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

// ── Mídia recebida ──────────────────────────────────────────────────────────
// conteudo vem como "/api/uploads/arquivo.ext" (documentos: "url|nome_original").
export function midiaUrl(conteudo?: string): string {
  if (!conteudo) return ''
  const p = conteudo.split('|')[0]
  return p.startsWith('http') ? p : `${API_BASE_URL}${p}`
}
export function nomeDocumento(conteudo?: string): string {
  return (conteudo || '').split('|')[1] || 'documento'
}

// ── Envio de arquivo (multipart; não usa apiFetch, que força JSON) ──────────
export type ArquivoUpload = { uri: string; name: string; type: string }

export async function enviarArquivo(conversaId: number, file: ArquivoUpload): Promise<Mensagem> {
  const token = await getAccessToken()
  const form = new FormData()
  form.append('conversa_id', String(conversaId))
  // React Native aceita { uri, name, type } como parte de arquivo do FormData.
  form.append('arquivo', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob)
  const res = await fetch(`${API_URL}/mensagens/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Falha ao enviar o arquivo.')
  return data as Mensagem
}
