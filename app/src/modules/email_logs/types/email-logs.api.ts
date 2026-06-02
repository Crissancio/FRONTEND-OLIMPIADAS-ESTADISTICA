import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoEmail = 'PENDIENTE' | 'EN_PROCESO' | 'ENVIADO' | 'FALLIDO';

export type TipoEmail = 
  | 'MASIVO_INSCRIPCION' 
  | 'RESPUESTA_CONTACTO' 
  | 'MAIL_INDIVIDUAL' 
  | 'NOTIFICACION';

// ==========================================
// 2. PARÁMETROS DE FILTRADO (PANEL DE MONITOREO)
// ==========================================
export interface EmailLogFilters {
  page?: number;
  limit?: number;
  tipo?: TipoEmail | null;
  estado?: EstadoEmail | null;
  id_campania?: number | null;
  es_estudiante?: boolean | null;
  es_contacto?: boolean | null;
  es_campania?: boolean | null;
  busqueda?: string | null; // Búsqueda global (asunto, destinatario)
  // Filtros de rangos de fechas (ISO strings)
  creacion_start?: string | null;
  creacion_end?: string | null;
  envio_start?: string | null;
  envio_end?: string | null;
  intento_start?: string | null;
  intento_end?: string | null;
}

// ==========================================
// 3. SUB-ENTIDADES DE RELACIÓN (LOGS DETALLADOS)
// ==========================================
export interface CampaniaMinimaLogDTO {
  id_campania_email: number;
  nombre: string;
}

export interface ContactoMinimoLogDTO {
  id_contacto: number;
  nombre_completo: string;
}

export interface ColegioMinimoLogDTO {
  nombre: string;
}

export interface EstudianteLogDTO {
  id_estudiante: number;
  nombres: string;
  paterno: string;
  materno?: string | null;
  colegio?: ColegioMinimoLogDTO | null;
}

// ==========================================
// 4. ENTIDADES PRINCIPALES (DTOs)
// ==========================================

// Estructura básica para las filas de las tablas
export interface EmailLogDTO {
  id_email_log: number;
  destinatario: string;
  asunto: string;
  tipo: TipoEmail;
  estado: EstadoEmail;
  error: string | null;
  intentas: number; // Mapeado del campo 'intentos' de la API
  intentos: number; 
  ultimo_intento: string | null;
  fecha_creacion: string;
  fecha_envio: string | null;
  id_estudiante: number | null;
  id_contacto: number | null;
  id_campania: number | null;
}

// Estructura extendida para modales de inspección técnica profunda
export interface EmailLogCompletoDTO extends EmailLogDTO {
  estudiante?: EstudianteLogDTO | null;
  contacto?: ContactoMinimoLogDTO | null;
  campania?: CampaniaMinimaLogDTO | null;
}

// ==========================================
// 5. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface EmailLogResponse {
  success?: boolean;
  data: EmailLogDTO;
  message: string;
}

export interface EmailLogCompletoResponse {
  success?: boolean;
  data: EmailLogCompletoDTO;
  message: string;
}

export interface PaginatedEmailLogResponse {
  success?: boolean;
  data: {
    items: EmailLogDTO[];
    meta: PaginationMeta;
  };
  message: string;
}