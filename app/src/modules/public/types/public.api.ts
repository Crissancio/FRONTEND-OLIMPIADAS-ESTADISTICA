import type { ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export type InicioResponseDTO = {
  convocatoria: ConvocatoriaResponseDTO | null
  material_principal: MaterialPrincipalDTO[]
  categorias: CategoriaResumenDTO[]
  avisos: AvisoInicioDTO[]
}

export type PublicInicioResponse = ResponseBase<InicioResponseDTO>

export type ConvocatoriaResponseDTO = {
  nombre_convocatoria: string
  gestion: number
  descripcion: string | null
  inicio_olimpiadas: string | null // date
  fin_olimpiadas: string | null // date
  fecha_inicio_inscripcion: string | null // date-time
  fecha_fin_inscripcion: string | null // date-time
  monto_inscripcion: number | null
  estado: string
  id_convocatoria: number
}

export type MaterialResponseDTO = {
  id_material: number
  nombre_material: string
  enlace_acceso: string
  descripcion: string | null
  fecha_creacion: string // date-time
  visibilidad: string
  tipo_material: string
  fecha_publicacion: string | null // date-time
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

export type FaseResponseDTO = {
  id_categoria_fk: number
  nombre_fase: string
  descripcion: string | null
  modalidad: string
  estado: string
  id_fase: number
}

export type AvisoResponseDTO = {
  id_aviso: number
  titulo: string
  descripcion: string
  tipo: string
  fecha_creacion: string // date-time
  fecha_publicacion: string | null // date-time
}

export type AvisoInicioDTO = {
  titulo: string
  descripcion: string
  tipo: string
  fecha_publicacion: string | null
}

export type ConvocatoriaDetalleDTO = {
  convocatoria: ConvocatoriaResponseDTO | null
  categorias: CategoriaResumenDTO[]
  materiales: MaterialResponseDTO[]
  afiche: MaterialResponseDTO | null
  convocatoria_documento: MaterialResponseDTO | null
  reglamento: MaterialResponseDTO | null
}

export type ColaboradorResponseDTO = {
  presentacion: string | null
  rol: string
  tipo: string
  correo: string
  id_colaborador: number
  nombres: string
  paterno: string
  materno: string | null
  perfil?: string | null
}

export type TipoColaborador = 'PERSONAL ACADEMICO' | 'ADMINISTRATIVO' | 'COLABORADOR'

export type PublicDetalleResponse = ResponseBase<ConvocatoriaDetalleDTO>
export type PublicFasesResponse = ResponseBase<FaseResponseDTO[]>
export type PublicMaterialesResponse = ResponseBase<MaterialResponseDTO[]>
export type PublicPersonalResponse = ResponseBase<ColaboradorResponseDTO[]>
