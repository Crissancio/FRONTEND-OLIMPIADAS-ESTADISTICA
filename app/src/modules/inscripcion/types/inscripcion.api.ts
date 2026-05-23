import type { ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export type VerificarEstudianteResponseDTO = {
  id_estudiante: number
  nombres: string
  paterno: string
  materno: string | null
  carnet_identidad: string
  fecha_nacimiento: string
  curso: number | null
  nivel: string | null
  rude: string | null
  telefono: number | null
  correo: string | null
  id_colegio: number | null
}

export type ColegioFiltroDTO = {
  id_colegio: number
  nombre: string
  turno: string
  municipio: string
}

export type EstudianteFormularioDTO = {
  nombres: string
  paterno: string
  materno: string | null
  carnet_identidad: string
  fecha_nacimiento: string // formato YYYY-MM-DD
  curso: number
  nivel: string
  rude: string | null
  telefono: number | null
  correo: string | null
}

export type RegistrarInscripcionDTO = {
  id_convocatoria: number
  id_categoria: number
  id_colegio: number
  estudiante: EstudianteFormularioDTO
}

export type PublicVerificarResponse = ResponseBase<VerificarEstudianteResponseDTO>
export type PublicColegiosResponse = ResponseBase<ColegioFiltroDTO[]>

export type InscripcionFormularioResponseDTO = {
  inscripcion: {
    id_inscripcion: number
    id_estudiante: number
    id_convocatoria: number
    id_categoria: number
    fecha_inscripcion: string
    estado: string
  }
  estudiante: Record<string, any>
  colegio: Record<string, any>
}

export type PublicInscripcionResponse = ResponseBase<InscripcionFormularioResponseDTO>