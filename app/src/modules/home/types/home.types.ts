import type { AvisoPrioridad, TipoAviso } from '@/modules/avisos/types/avisos.api'
import type { EstadoTemporal } from '@/modules/convocatorias/types/convocatorias.api'

export type HomeConvocatoria = {
  id: string
  nombre: string
  gestion: number
  estado_temporal: EstadoTemporal
  descripcionBreve: string
  fechas:string | null,
  inicio_olimpiadas: string | null
  fin_olimpiadas: string | null
  fecha_inicio_inscripcion: string | null
  fecha_fin_inscripcion: string | null

  material_principal: MaterialPrincipalDTO[]
  categorias: CategoriaResumenDTO[]
}


export type HomeAviso = {
  id: string
  titulo: string
  descripcion: string
  tipo: TipoAviso
  prioridad: AvisoPrioridad
  fecha: string
}
export type MaterialPrincipalDTO = {
  enlace_acceso: string | null
  importancia_tipo: string | null
}


export type CategoriaResumenDTO = {
  id_categoria: number
  nombre_categoria: string
  nivel: string
  curso: number
}
