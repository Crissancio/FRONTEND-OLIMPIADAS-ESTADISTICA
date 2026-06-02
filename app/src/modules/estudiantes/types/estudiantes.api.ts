import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type NivelEducativo = 'PRIMARIA' | 'SECUNDARIA';
export type EstadoPersona = 'ACTIVO' | 'INACTIVO';
export type TurnoColegio = 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MIXTO';

// ==========================================
// 2. PARÁMETROS DE BÚSQUEDA (FILTROS AVANZADOS)
// ==========================================
export interface EstudianteFilters {
  page?: number;
  limit?: number;
  search?: string | null;
  carnet?: string | null;
  telefono?: string | null;
  rude?: string | null;
  mes_nacimiento?: number | null;
  anio_nacimiento?: number | null;
  nivel?: NivelEducativo | null;
  curso?: number | null;
  id_colegio?: number | null;
}

// ==========================================
// 3. SUB-ENTIDADES / DEPENDENCIAS
// ==========================================
export interface ColegioMinimoDTO {
  id_colegio: number;
  nombre: string;
  turno: TurnoColegio;
}

// ==========================================
// 4. ENTIDAD PRINCIPAL (DTO de Respuesta)
// ==========================================
export interface EstudianteDTO {
  id_estudiante: number;
  id_colegio: number;
  carnet_identidad: string;
  curso: number;
  nivel: NivelEducativo;
  fecha_nacimiento: string;
  rude?: string | null;
  telefono?: string | null;
  correo?: string | null;
  nombres: string;
  paterno: string;
  materno?: string | null;
  estado: EstadoPersona;
  colegio?: ColegioMinimoDTO | null;
}

// ==========================================
// 5. PAYLOADS PARA CREAR/ACTUALIZAR/EXPORTAR
// ==========================================
export interface EstudianteCreateDTO {
  id_colegio: number;
  carnet_identidad: string;
  curso: number;
  nivel: NivelEducativo;
  fecha_nacimiento: string;
  rude?: string | null;
  telefono?: string | null;
  correo?: string | null;
  nombres: string;
  paterno: string;
  materno?: string | null;
}

export interface EstudianteUpdateDTO {
  nombres?: string | null;
  paterno?: string | null;
  materno?: string | null;
  id_colegio?: number | null;
  curso?: number | null;
  nivel?: NivelEducativo | null;
  rude?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

export interface EstudianteEstadoUpdateDTO {
  estado: EstadoPersona;
}

export interface ExportarEstudiantesDTO {
  ids: number[];
}

// ==========================================
// 6. RESPUESTAS DE LA API
// ==========================================
export interface EstudianteResponse {
  success?: boolean;
  data: EstudianteDTO;
  message: string;
}

export interface PaginatedEstudianteResponse {
  success?: boolean;
  data: {
    items: EstudianteDTO[];
    meta: PaginationMeta;
  };
  message: string;
}