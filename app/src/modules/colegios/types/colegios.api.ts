import type { DirectorResponseDTO } from '@/modules/directores/types/directores.api'

export interface ColegioResponseDTO {
  id_colegio: number
  codigo: number
  nombre: string
  tipo: string
  turno: string
  departamento: string
  municipio: string
  calle?: string | null
  estado: string
}

export interface ColegioDetailResponseDTO extends ColegioResponseDTO {
  directores: DirectorResponseDTO[]
}

export interface ColegioCreateDTO {
  codigo: number
  nombre: string
  tipo: string
  turno: string
  departamento: string
  municipio: string
  calle?: string | null
}

export interface ColegioUpdateDTO {
  codigo?: number
  nombre?: string
  tipo?: string
  turno?: string
  departamento?: string
  municipio?: string
  calle?: string | null
}

export interface ColegioFilters {
  nombre?: string
  municipio?: string
  estado?: string
  tipo?: string
  turno?: string
  director_nombre?: string
}

export interface ColegioCSVImportDTO {
  codigo: number
  nombre: string
  tipo: string
  turno: string
  departamento: string
  municipio: string
  calle?: string | null
}

export interface CSVErrorDTO {
  fila: number
  error: string
  datos: any
}

export interface CSVUploadResponseDTO {
  validos: ColegioCSVImportDTO[]
  errores: CSVErrorDTO[]
  total_procesados: number
}

export interface CSVImportDBResponseDTO {
  insertados: number
  errores: number
  archivo_errores?: string | null
}