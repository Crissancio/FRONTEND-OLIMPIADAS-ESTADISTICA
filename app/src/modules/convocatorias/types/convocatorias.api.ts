import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ESTADOS CONSTANTES
// ==========================================
export type EstadoConvocatoria = 'BORRADOR' | 'PUBLICADA' | 'CANCELADA' | 'OCULTA';

export type EstadoTemporal = 
  | 'BORRADOR' | 'OCULTA' | 'CANCELADA' | 'PROXIMA' 
  | 'INSCRIPCIONES PROXIMAS' | 'INSCRIPCION EN CURSO' 
  | 'EN CURSO' | 'FINALIZADA';

// ==========================================
// 2. PARÁMETROS DE BÚSQUEDA (FILTROS)
// ==========================================
export interface ConvocatoriaFilters {
  page?: number;
  limit?: number;
  estado?: EstadoConvocatoria | null;
  estado_temporal?: EstadoTemporal | null;
  start_date?: string | null;
  end_date?: string | null;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs)
// ==========================================
export interface ConvocatoriaDTO {
  id_convocatoria: number;
  nombre_convocatoria: string;
  gestion: number;
  descripcion?: string | null;
  inicio_olimpiadas?: string | null;
  fin_olimpiadas?: string | null;
  fecha_inicio_inscripcion?: string | null;
  fecha_fin_inscripcion?: string | null;
  monto_inscripcion?: number | null;
  estado: EstadoConvocatoria;
  estado_temporal: EstadoTemporal;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ConvocatoriaCreateDTO {
  nombre_convocatoria: string;
  gestion: number;
  descripcion?: string | null;
  inicio_olimpiadas?: string | null;
  fin_olimpiadas?: string | null;
  fecha_inicio_inscripcion?: string | null;
  fecha_fin_inscripcion?: string | null;
  monto_inscripcion?: number | null;
}

export interface ConvocatoriaUpdateDTO {
  nombre_convocatoria?: string | null;
  gestion?: number | null;
  descripcion?: string | null;
  inicio_olimpiadas?: string | null;
  fin_olimpiadas?: string | null;
  fecha_inicio_inscripcion?: string | null;
  fecha_fin_inscripcion?: string | null;
  monto_inscripcion?: number | null;
}

// ==========================================
// 4. RESPUESTAS DE LA API (Wrappers limpios)
// ==========================================
export interface ConvocatoriaResponse {
  success?: boolean;
  data: ConvocatoriaDTO;
  message: string;
}

export interface PaginatedConvocatoriaResponse {
  success?: boolean;
  data: {
    items: ConvocatoriaDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface BaseDictResponse {
  success?: boolean;
  data: Record<string, unknown>;
  message: string;
}