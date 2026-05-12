import type { PaginatedResponse, ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export type ModalidadFase = 'VIRTUAL' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
export type EstadoEntidad = 'BORRADOR' | 'LISTA' | 'ELIMINADA'

export interface FaseCreateDTO {
  id_categoria_fk: number
  nombre_fase: string
  descripcion?: string | null
  modalidad: ModalidadFase
  estado: EstadoEntidad
}

export interface FaseUpdateDTO {
  nombre_fase?: string | null
  descripcion?: string | null
  modalidad?: ModalidadFase | null
  estado?: EstadoEntidad | null
}

export interface FaseResponseDTO {
  id_categoria_fk: number
  nombre_fase: string
  descripcion: string | null
  modalidad: string
  estado: string
  id_fase: number
  fecha_inicio?: string | null
  fecha_fin?: string | null
  fecha_realizacion?: string | null
  lugar_realizacion?: string | null
  criterio_aprobacion?: number | null
  id_fase_anterior?: number | null
}

export interface FasePreparacionCreateDTO extends FaseCreateDTO {
  fecha_inicio: string
  fecha_fin: string
}

export interface FasePruebaCreateDTO extends FaseCreateDTO {
  id_fase_anterior?: number | null
  criterio_aprobacion: number
  fecha_realizacion: string
  lugar_realizacion?: string | null
}

export type FaseListResponse = PaginatedResponse<FaseResponseDTO>
export type FaseResponse = ResponseBase<FaseResponseDTO>
