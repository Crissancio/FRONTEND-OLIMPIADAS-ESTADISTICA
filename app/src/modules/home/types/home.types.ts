export type HomeConvocatoria = {
  id: string
  nombre: string
  gestion: number
  estado: string
  descripcionBreve: string
  fechas: string
  categorias: { id: string; nombre: string }[]
}

export type HomeAviso = {
  id: string
  titulo: string
  descripcion: string
  tipo: 'Importante' | 'Urgente' | 'Info'
  fecha: string
}