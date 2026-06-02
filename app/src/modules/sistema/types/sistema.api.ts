import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. ENUMS / TIPOS CONSTANTES
// ==========================================
export type TipoAccion = 
  | 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'PUBLICAR' 
  | 'OCULTAR' | 'REPROGRAMAR' | 'RESPONDER' | 'LOGIN_FALLIDO';

export type TipoModulo = 
  | 'CONVOCATORIA' | 'INSCRIPCION' | 'RESULTADO' | 'AVISO' 
  | 'ADMINISTRADOR' | 'CONTACTO' | 'CAMPANIA' | 'EMAIL_LOG' 
  | 'CATEGORIA' | 'FASE_PRUEBA' | 'FASE_PREPARACION' 
  | 'COLABORADOR' | 'ESTUDIANTE' | 'DIRECTOR' | 'COLEGIO' 
  | 'MATERIAL' | 'AUTH';

export type TipoActividad = 'INSCRIPCION' | 'EMAIL';

// ==========================================
// 2. PARÁMETROS DE BÚSQUEDA (FILTROS)
// ==========================================
export interface BasePaginationParams {
  page?: number;
  limit?: number;
}

export interface AuditoriaFilters extends BasePaginationParams {
  fecha_start?: string | null;
  fecha_end?: string | null;
  modulo?: TipoModulo | null;
  accion?: TipoAccion | null;
  busqueda?: string | null;
}

export interface ExportarAuditoriaCsvParams {
  fecha_start: string;
  fecha_end: string;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs)
// ==========================================
export interface ActividadRecienteDTO {
  id_registro: number;
  tipo_registro: string;
  fecha: string;
  descripcion?: string | null;
  accion?: string | null;
  modulo?: string | null;
  titulo?: string | null;
  tipo_actividad?: string | null;
}

export interface ActividadSistemaDTO {
  id_actividad: number;
  tipo: TipoActividad;
  titulo: string;
  descripcion: string | null;
  fecha: string;
}

export interface AuditoriaDTO {
  id_auditoria: number;
  id_administrador: number;
  admin_nombre: string;
  accion: string;
  descripcion: string | null;
  modulo: TipoModulo;
  fecha: string;
}

export interface EventoProximoDTO {
  tipo: string;
  titulo: string;
  descripcion?: string | null;
  fecha: string;
  referencia_id: number;
}

// ---- DASHBOARD ----
export interface DashboardConvocatoriaActiva {
  id_convocatoria: number;
  nombre_convocatoria: string;
}

export interface DashboardEstadisticasInscripcion {
  total: number;
  aprobados: number;
  pendientes: number;
}

export interface AdminDashboardDTO {
  convocatoria_activa: DashboardConvocatoriaActiva | null;
  inscripciones: DashboardEstadisticasInscripcion;
  avisos_visibles: number;
}

// ==========================================
// 4. RESPUESTAS DE LA API (Wrappers)
// ==========================================
export interface PaginatedActividadRecienteResponse {
  success?: boolean;
  data: { items: ActividadRecienteDTO[]; meta: PaginationMeta };
  message: string;
}

export interface PaginatedActividadSistemaResponse {
  success?: boolean;
  data: { items: ActividadSistemaDTO[]; meta: PaginationMeta };
  message: string;
}

export interface PaginatedAuditoriaResponse {
  success?: boolean;
  data: { items: AuditoriaDTO[]; meta: PaginationMeta };
  message: string;
}

export interface PaginatedEventoProximoResponse {
  success?: boolean;
  data: { items: EventoProximoDTO[]; meta: PaginationMeta };
  message: string;
}

export interface AdminDashboardResponse {
  success?: boolean;
  data: AdminDashboardDTO;
  message: string;
}