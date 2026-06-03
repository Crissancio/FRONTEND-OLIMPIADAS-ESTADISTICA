import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type AvisoPrioridad = 'BAJA' | 'MEDIA' | 'ALTA';

export type TipoAviso = 
  | 'CONVOCATORIA' | 'INSCRIPCION' | 'CRONOGRAMA' | 'MATERIAL' 
  | 'EXAMEN' | 'LOGISTICA' | 'RESULTADO' | 'RECLAMO' 
  | 'CEREMONIA' | 'CAPACITACION' | 'MANTENIMIENTO' | 'SOPORTE' | 'GENERAL';

export type EstadoAviso = 'BORRADOR' | 'PUBLICADO' | 'OCULTO';

// ==========================================
// 2. PARÁMETROS DE FILTRADO
// ==========================================
export interface AvisoFilters {
  page?: number;
  limit?: number;
  titulo?: string | null;
  descripcion?: string | null;
  tipo?: TipoAviso | null;
  prioridad?: AvisoPrioridad | null;
  estado?: EstadoAviso | null;
  fecha_creacion?: string | null;
  fecha_publicacion: string | null;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs de Respuesta)
// ==========================================
export interface AvisoDTO {
  id_aviso: number;
  titulo: string;
  descripcion: string;
  tipo: TipoAviso;
  prioridad: AvisoPrioridad;
  fecha_creacion: string;
  fecha_publicacion?: string | null;
  estado: EstadoAviso;
  estado_temporal?: string | null;
}

// ==========================================
// 4. PAYLOADS DE PETICIÓN (REQUEST)
// ==========================================
export interface AvisoCreateDTO {
  titulo: string;
  descripcion: string;
  tipo: TipoAviso;
  prioridad?: AvisoPrioridad;
  fecha_publicacion?: string | null;
}

export interface AvisoUpdateDTO {
  titulo?: string | null;
  descripcion?: string | null;
  tipo?: TipoAviso | null;
  prioridad?: AvisoPrioridad | null;
  fecha_publicacion?: string | null;
}

export interface AvisoEstadoUpdateDTO {
  estado: EstadoAviso;
}

// ==========================================
// 5. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface PaginatedAvisoResponse {
  success?: boolean;
  data: {
    items: AvisoDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface AvisoResponse {
  success?: boolean;
  data: AvisoDTO;
  message: string;
}
