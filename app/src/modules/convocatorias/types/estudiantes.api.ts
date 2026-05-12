import type { PaginatedResponse, ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export type EstadoInscripcion = 'RECHAZADO' | 'PENDIENTE' | 'APROBADO'

export interface EstudianteCreateDTO {
  id_colegio: number
  carnet_identidad: string
  curso: number
  nivel: string
  fecha_nacimiento: string
  rude?: string | null
  telefono?: number | null
  correo?: string | null
  nombres: string
  paterno: string
  materno?: string | null
}

export interface EstudianteResponseDTO {
  id_colegio: number
  carnet_identidad: string
  curso: number
  nivel: string
  fecha_nacimiento: string
  rude: string | null
  telefono: number | null
  correo: string | null
  id_estudiante: number
  nombres: string
  paterno: string
  materno: string | null
  nombre_colegio?: string | null
  id_convocatoria?: number | null
  id_categoria?: number | null
  estado_inscripcion?: EstadoInscripcion | null
  fecha_inscripcion?: string | null
}

export type EstudianteListResponse = PaginatedResponse<EstudianteResponseDTO>
export type EstudianteResponse = ResponseBase<EstudianteResponseDTO>
