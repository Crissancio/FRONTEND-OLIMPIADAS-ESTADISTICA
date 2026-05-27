import type { PaginatedResponse, ResponseBase } from '@/shared/types/api.types'

export interface ColaboradorResponseDTO {
  id_colaborador: number
  nombres: string
  paterno: string
  materno: string | null
  correo: string
  rol: string
  tipo: string
  presentacion: string | null
  perfil: string | null
  estado: string
}

export interface GetColaboradoresParams {
  page?: number
  limit?: number
  nombre?: string | null
  correo?: string | null
  tipo?: string | null
  rol?: string | null
}

export interface ColaboradorPayload {
  nombres: string
  paterno: string
  materno?: string | null
  correo: string
  rol: string
  tipo: string
  presentacion?: string | null
  perfil?: File | null
}