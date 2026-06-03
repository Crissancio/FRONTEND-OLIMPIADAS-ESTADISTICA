import type { PaginationMeta } from '@/shared/types/api.types';
import type { DirectorDTO } from '@/modules/personas/types/personas.api'; // Reutilizamos el DTO que me pasaste uwu

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoColegio = 'ACTIVO' | 'REVISADO' | 'RECHAZADO' | 'PENDIENTE' | 'INACTIVO';
export type TipoColegio = 'PRIVADO' | 'CONVENIO' | 'PUBLICO';
export type TurnoColegio = 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MIXTO';

// ==========================================
// 2. PARÁMETROS DE FILTRADO
// ==========================================
export interface ColegioFilters {
  page?: number;
  limit?: number;
  nombre?: string | null;
  municipio?: string | null;
  estado?: EstadoColegio | '' | null;
  tipo?: TipoColegio | '' | null;
  turno?: TurnoColegio | '' | null;
  director_nombre?: string | null;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs de Respuesta)
// ==========================================
export interface ColegioDTO {
  id_colegio: number;
  codigo: number;
  nombre: string;
  tipo: TipoColegio;
  turno: TurnoColegio;
  departamento: string;
  municipio: string;
  calle?: string | null;
  estado: EstadoColegio;
}

export interface ColegioDetailDTO extends ColegioDTO {
  directores?: DirectorDTO[];
}

// ==========================================
// 4. PAYLOADS DE PETICIÓN (REQUEST)
// ==========================================
export interface ColegioCreateDTO {
  codigo: number;
  nombre: string;
  tipo: TipoColegio;
  turno: TurnoColegio;
  departamento: string;
  municipio: string;
  calle?: string | null;
  estado?: EstadoColegio | null;
}

export interface ColegioUpdateDTO {
  codigo?: number | null;
  nombre?: string | null;
  tipo?: TipoColegio | null;
  turno?: TurnoColegio | null;
  departamento?: string | null;
  municipio?: string | null;
  calle?: string | null;
  estado?: EstadoColegio | null;
}

// ==========================================
// 5. IMPORTACIÓN MASIVA (CSV)
// ==========================================
export interface BodySubirCsvColegios {
  departamento: string;
  file: Blob;
}

export interface DirectorCSVImportDTO {
  nombres: string;
  paterno: string;
  materno?: string | null;
  telefono_1?: string | null;
  telefono_2?: string | null;
}

export interface ColegioCSVImportDTO {
  codigo: number;
  nombre: string;
  tipo: TipoColegio;
  turno: TurnoColegio;
  departamento: string;
  municipio: string;
  calle?: string | null;
  estado: EstadoColegio;
  directores: DirectorCSVImportDTO[];
}

export interface CSVImportErrorDTO {
  fila: number;
  codigo?: string | null;
  nombre?: string | null;
  error: string;
}

export interface CSVUploadResponseData {
  total_validos: number;
  total_errores: number;
  validos: ColegioCSVImportDTO[];
  errores: CSVImportErrorDTO[];
  filas_error_csv: Record<string, unknown>[];
  csv_errores_url?: string | null;
}

export type CSVUploadResponseDTO = CSVUploadResponseData;

export interface CSVImportDBResponseData {
  insertados: number;
  errores: CSVImportErrorDTO[];
}

// ==========================================
// 6. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface PaginatedColegioResponse {
  success?: boolean;
  data: {
    items: ColegioDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface ColegioResponse {
  success?: boolean;
  data: ColegioDTO;
  message: string;
}

export interface ColegioDetailResponse {
  success?: boolean;
  data: ColegioDetailDTO;
  message: string;
}

export interface CSVUploadWrapperResponse {
  success?: boolean;
  data: CSVUploadResponseData;
  message: string;
}

export interface CSVImportDBWrapperResponse {
  success?: boolean;
  data: CSVImportDBResponseData;
  message: string;
}

export interface GeneralDictResponse {
  success?: boolean;
  data: Record<string, unknown>;
  message: string;
}

export type CSVImportDBResponseDTO = CSVImportDBResponseData;

export type ColegioResponseDTO = ColegioDTO;
