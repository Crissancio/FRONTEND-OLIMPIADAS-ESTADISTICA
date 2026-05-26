import type { ResponseBase } from '@/modules/auth/types/auth.types'

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type PaginatedData<T> = {
  items: T[]
  meta: PaginationMeta
}

export type PaginatedResponse<T> = {
  success?: boolean
  data: PaginatedData<T>
  message: string
}

export type AdministradorEstado = string

export type AdministradorResponseDTO = {
  id_administrador: number
  nombre: string
  correo: string
  estado: AdministradorEstado
}

export type AdministradorCreateDTO = {
  nombre: string
  correo: string
  contrasena: string
}

export type AdministradorUpdateDTO = {
  nombre?: string | null
  correo?: string | null
}

export type AdministradoresListParams = {
  page?: number
  limit?: number
  nombre?: string | null
  correo?: string | null
}

export type AdministradoresListResponse = PaginatedResponse<AdministradorResponseDTO>
export type AdministradorResponse = ResponseBase<AdministradorResponseDTO>
