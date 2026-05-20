import type { PaginatedResponse, ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export type TipoMaterial = 'VIDEO' | 'EXAMEN' | 'SOLUCIONARIO' | 'EJERCICIOS' | 'OTRO'

export interface MaterialCreateDTO {
  nombre_material: string
  tipo_material: TipoMaterial
  descripcion?: string | null
  fecha_publicacion?: string | null
  id_convocatoria?: number | null
  id_categoria?: number | null
  id_fase?: number | null
  archivo: File
}

export interface MaterialUpdateDTO {
  nombre_material?: string | null
  tipo_material?: TipoMaterial | null
  descripcion?: string | null
  fecha_publicacion?: string | null
  id_convocatoria?: number | null
  id_categoria?: number | null
  id_fase?: number | null
  archivo?: File | null
}

export interface MaterialResponseDTO {
  id_material: number
  nombre_material: string
  enlace_acceso: string
  descripcion: string | null
  fecha_creacion: string
  tipo_material: string
  fecha_publicacion: string | null
  id_convocatoria?: number | null
  id_categoria?: number | null
  id_fase?: number | null
  fase?: string | null
}

export type MaterialListResponse = PaginatedResponse<MaterialResponseDTO>
export type MaterialResponse = ResponseBase<MaterialResponseDTO>

export type MaterialListBaseResponse = ResponseBase<MaterialResponseDTO[]>
