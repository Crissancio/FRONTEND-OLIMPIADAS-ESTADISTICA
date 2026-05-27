export interface AvisoDTO {
  id_aviso: number
  titulo: string
  descripcion: string
  tipo: string
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  estado: 'BORRADOR' | 'PUBLICADO' | 'OCULTO'
  fecha_publicacion: string | null
  fecha_creacion: string
  estado_temporal: 'PUBLICADO' | 'EN_ESPERA' | 'NO_VISIBLE'
}

export interface AvisoCreateDTO {
  titulo: string
  descripcion: string
  tipo: string
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  fecha_publicacion?: string | null
}

export interface AvisoUpdateDTO {
  titulo?: string
  descripcion?: string
  tipo?: string
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA'
  fecha_publicacion?: string | null
}

export interface AvisoEstadoUpdateDTO {
  estado: 'BORRADOR' | 'PUBLICADO' | 'OCULTO'
}

export interface AvisoFilters {
  titulo?: string
  descripcion?: string
  tipo?: string
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA'
  estado?: 'BORRADOR' | 'PUBLICADO' | 'OCULTO'
  fecha_publicacion?: string
}