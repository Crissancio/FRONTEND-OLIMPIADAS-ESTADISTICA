import type { PaginatedResponse, ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export type NivelEducativo = 'PRIMARIA' | 'SECUNDARIA'
export type EstadoEntidad = 'BORRADOR' | 'LISTA' | 'ELIMINADA'

export interface CategoriaCreateDTO {
  id_convocatoria: number
  nombre_categoria: string
  curso: number
  nivel: NivelEducativo
  estado: EstadoEntidad
}

export interface CategoriaUpdateDTO {
  nombre_categoria?: string | null
  curso?: number | null
  nivel?: NivelEducativo | null
  estado?: EstadoEntidad | null
}

export interface CategoriaResponseDTO {
  id_convocatoria: number
  nombre_categoria: string
  curso: number
  nivel: string
  estado: string
  id_categoria: number
}

export type CategoriaListResponse = PaginatedResponse<CategoriaResponseDTO>
export type CategoriaResponse = ResponseBase<CategoriaResponseDTO>
