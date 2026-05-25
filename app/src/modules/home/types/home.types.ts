export type HomeConvocatoria = {
  id: string
  nombre: string
  gestion: number
  estado: string
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
  tipo: 'IMPORTANTE' | 'COMUNICADO' | 'OTRO'
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