import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoResultado = 'BORRADOR' | 'PUBLICADO' | 'OCULTO';
export type EstadoAprobacion = 'APROBADO' | 'REPROBADO' | 'TODOS';
export type SortByResultados = 'nota' | 'apellido';
export type SortByAprobados = 'nombre' | 'paterno' | 'materno' | 'ci' | 'resultado';
export type SortOrder = 'asc' | 'desc';

// ==========================================
// 2. PARÁMETROS DE BÚSQUEDA Y FILTRADO
// ==========================================
export interface ResultadoFilters {
  id_fase_prueba: number; // Obligatorio según la especificación
  page?: number;
  limit?: number;
  search?: string | null;
  estado_aprobacion?: 'APROBADO' | 'REPROBADO' | null;
  sort_by?: SortByResultados | null;
  sort_order?: SortOrder;
}

export interface AprobadosFaseFilters {
  sort_by?: SortByAprobados;
  sort_order?: SortOrder;
}

export interface ExportarFaseFilters {
  estado_aprobacion?: EstadoAprobacion;
  incluir_nombres?: boolean;
}

// ==========================================
// 3. SUB-ENTIDADES Y MODELOS DE NEGOCIO
// ==========================================
export interface ResultadoDTO {
  id_resultado: number;
  id_inscripcion: number;
  id_fase_prueba: number;
  id_categoria: number;
  nota: number;
  observaciones?: string | null;
  estado: EstadoResultado;
  carnet_identidad: string;
  nombres: string;
  paterno: string;
  materno?: string | ""

}

export interface ResultadoAprobatorioDTO {
  id_inscripcion: number;
  id_estudiante: number;
  carnet_identidad: string;
  nombres: string;
  paterno: string;
  materno: string;
  nota: number;
}

// Estructuras para el reporte de análisis de CSV masivo
export interface ValidRowDTO {
  ci: string;
  nota: number;
  id_inscripcion: number;
  observaciones?: string | null;
}

export interface ExistingRowDTO {
  ci: string;
  resultado_csv: number;
  resultado_actual: number;
  id_inscripcion: number;
  observaciones?: string | null;
}

export interface ErrorRowDTO {
  fila: number;
  ci?: string | null;
  error: string;
}

export interface AnalisisImportacionDTO {
  token: string;
  validos_nuevos: ValidRowDTO[];
  existentes: ExistingRowDTO[];
  errores: ErrorRowDTO[];
  archivo_errores?: string | null;
}

// ==========================================
// 4. PAYLOADS DE PETICIÓN (REQUEST DTOs)
// ==========================================
export interface ResultadoCreateDTO {
  id_inscripcion: number;
  id_fase_prueba: number;
  id_categoria: number;
  nota: number;
  observaciones?: string | null;
}

export interface ResultadoUpdateDTO {
  nota?: number | null;
  observaciones?: string | null;
}

export interface ResultadoEstadoUpdateDTO {
  estado: EstadoResultado;
}

export interface ResultadoMasivoCreateDTO {
  id_fase_prueba: number;
  id_categoria: number;
  ids_inscripciones: number[];
}

export interface ResultadoMasivoUpdateItemDTO {
  id_resultado: number;
  nota: number;
  observaciones?: string | null;
}

export interface ResultadoMasivoUpdateDTO {
  id_fase_prueba: number;
  resultados: ResultadoMasivoUpdateItemDTO[];
}

export interface ConfirmarImportacionDTO {
  token: string;
  sobreescribir_existentes: boolean;
}

// ==========================================
// 5. WRAPPERS DE RESPUESTAS DE LA API
// ==========================================
export interface ResultadoResponse {
  success?: boolean;
  data: ResultadoDTO;
  message: string;
}

export interface PaginatedResultadoResponse {
  success?: boolean;
  data: {
    items: ResultadoDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface ListAprobadosResponse {
  success?: boolean;
  data: ResultadoAprobatorioDTO[];
  message: string;
}

export interface AnalisisImportacionResponse {
  success?: boolean;
  data: AnalisisImportacionDTO;
  message: string;
}

export interface GeneralIntResponse {
  success?: boolean;
  data: number; // Usualmente devuelve la cantidad de filas afectadas
  message: string;
}

export interface GeneralDictResponse {
  success?: boolean;
  data: Record<string, unknown>;
  message: string;
}