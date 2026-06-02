import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoInscripcion = 'RECHAZADO' | 'PENDIENTE' | 'APROBADO';
export type NivelEducativo = 'PRIMARIA' | 'SECUNDARIA';

// ==========================================
// 2. PARÁMETROS DE FILTRADO (PANEL ADMIN)
// ==========================================
export interface InscripcionFilters {
  page?: number;
  limit?: number;
  id_colegio?: number | null;
  id_categoria?: number | null;
  estado?: EstadoInscripcion | null;
  search_nombre?: string | null;
  search_documento?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

// ==========================================
// 3. SUB-ENTIDADES MINIFICADAS
// ==========================================
export interface CategoriaMinimaDTO {
  id_categoria: number;
  nombre_categoria: string;
}

export interface EstudianteMinimoDTO {
  id_estudiante: number;
  nombres: string;
  paterno: string;
  materno?: string | null;
  carnet_identidad: string;
  rude?: string | null;
}

// ==========================================
// 4. ENTIDADES PRINCIPALES (DTOs de Respuesta)
// ==========================================
export interface InscripcionDTO {
  id_inscripcion: number;
  id_estudiante: number;
  id_convocatoria: number;
  id_categoria: number;
  fecha_inscripcion: string;
  estado: EstadoInscripcion;
  estudiante?: EstudianteMinimoDTO | null;
  categoria?: CategoriaMinimaDTO | null;
}

export interface EstudianteBusquedaDTO {
  id_estudiante: number;
  nombres: string;
  paterno: string;
  materno?: string | null;
  carnet_identidad: string;
  fecha_nacimiento: string;
  curso?: number | null;
  nivel?: NivelEducativo | null;
  rude?: string | null;
  telefono?: string | null;
  correo?: string | null;
  id_colegio?: number | null;
  ya_inscrito?: boolean;
  id_inscripcion?: number | null;
  restriccion_edad?: string | null;
}

export interface InscripcionFormularioResponseDTO {
  inscripcion: InscripcionDTO;
  estudiante: Record<string, unknown>;
  colegio: Record<string, unknown>;
}

// ==========================================
// 5. PAYLOADS DE PETICIÓN (REQUEST)
// ==========================================
export interface EstudianteBuscarRequestDTO {
  carnet_identidad: string;
  fecha_nacimiento: string;
  username_hp?: string;           // Honeypot anti-bots
  cf_turnstile_response?: string; // Cloudflare Turnstile
}

export interface EstudianteFormularioDTO {
  nombres: string;
  paterno: string;
  materno?: string | null;
  carnet_identidad: string;
  fecha_nacimiento: string;
  curso: number;
  nivel: NivelEducativo;
  rude?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

export interface InscripcionFormularioRequestDTO {
  id_convocatoria: number;
  id_colegio: number;
  estudiante: EstudianteFormularioDTO;
  username_hp?: string;
  cf_turnstile_response?: string;
}

export interface InscripcionAdminCreateDTO {
  id_estudiante: number;
  id_convocatoria: number;
  id_categoria: number;
}

export interface InscripcionEstadoUpdateDTO {
  estado: EstadoInscripcion;
}

export interface ExportarInscripcionesRequestDTO {
  id_inscripciones: number[];
}

// ==========================================
// 6. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface InscripcionResponse {
  success?: boolean;
  data: InscripcionDTO;
  message: string;
}

export interface PaginatedInscripcionResponse {
  success?: boolean;
  data: {
    items: InscripcionDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface EstudianteBusquedaResponse {
  success?: boolean;
  data: EstudianteBusquedaDTO;
  message: string;
}

export interface InscripcionFormularioResponse {
  success?: boolean;
  data: InscripcionFormularioResponseDTO;
  message: string;
}

export interface GeneralDictResponse {
  success?: boolean;
  data: Record<string, unknown>;
  message: string;
}