import type { DirectorResponseDTO, DirectorCSVImportDTO } from '@/modules/directores/types/directores.api'

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
  estado: string
  directores: DirectorCSVImportDTO[]
}

export interface CSVImportErrorDTO {
  fila: number
  codigo?: string | null
  nombre?: string | null
  error: string
}

export interface CSVUploadResponseDTO {
  total_validos: number
  total_errores: number
  validos: ColegioCSVImportDTO[]
  errores: CSVImportErrorDTO[]
  filas_error_csv: Record<string, any>[]
  csv_errores_url?: string | null
}

export interface CSVImportDBResponseDTO {
  insertados: number
  errores: CSVImportErrorDTO[]
}