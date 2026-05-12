export interface ResponseBase<T> {
  success: boolean
  data: T
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PaginatedData<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginatedResponse<T> {
  success: boolean
  data: PaginatedData<T>
  message: string
}

export interface ConvocatoriaCreateDTO {
  nombre_convocatoria: string
  gestion: number
  descripcion?: string | null
  inicio_olimpiadas?: string | null // date: YYYY-MM-DD
  fin_olimpiadas?: string | null // date: YYYY-MM-DD
  fecha_inicio_inscripcion?: string | null // date-time
  fecha_fin_inscripcion?: string | null // date-time
  monto_inscripcion?: number | null
}

export interface ConvocatoriaUpdateDTO {
  nombre_convocatoria?: string | null
  gestion?: number | null
  descripcion?: string | null
  inicio_olimpiadas?: string | null
  fin_olimpiadas?: string | null
  fecha_inicio_inscripcion?: string | null
  fecha_fin_inscripcion?: string | null
  monto_inscripcion?: number | null
  estado?: string | null
}

export interface ConvocatoriaResponseDTO {
  nombre_convocatoria: string
  gestion: number
  descripcion: string | null
  inicio_olimpiadas: string | null
  fin_olimpiadas: string | null
  fecha_inicio_inscripcion: string | null
  fecha_fin_inscripcion: string | null
  monto_inscripcion: number | null
  estado: string
  id_convocatoria: number
}
