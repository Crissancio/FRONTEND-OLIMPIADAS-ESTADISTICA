import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoCampania = 
  | 'BORRADOR' 
  | 'PROGRAMADA' 
  | 'EN_PROCESO' 
  | 'FINALIZADA' 
  | 'CANCELADA' 
  | 'FALLIDA';

// ==========================================
// 2. PARÁMETROS DE FILTRADO (CAMPOS DE RANGO Y BÚSQUEDA)
// ==========================================
export interface CampaniaFilters {
  page?: number;
  limit?: number;
  nombre?: string | null;
  asunto?: string | null;
  estado?: EstadoCampania | null;
  // Rangos de fecha en formato ISO string (YYYY-MM-DD)
  creacion_start?: string | null;
  creacion_end?: string | null;
  prog_start?: string | null;
  prog_end?: string | null;
  inicio_start?: string | null;
  inicio_end?: string | null;
  fin_start?: string | null;
  fin_end?: string | null;
}

// ==========================================
// 3. SUB-ENTIDADES REUTILIZABLES
// ==========================================
export interface EnlaceDTO {
  url: string;
  texto: string;
}

export interface ColegioMinimoDTO {
  nombre: string;
}

export interface EstudianteDestinatarioDTO {
  id_estudiante: number;
  nombres: string;
  paterno: string;
  materno?: string | null;
  correo?: string | null;
  telefono?: string | null;
  colegio?: ColegioMinimoDTO | null;
}

export interface CampaniaDestinatarioDTO {
  estudiante: EstudianteDestinatarioDTO;
}

// ==========================================
// 4. ENTIDADES PRINCIPALES (DTOs de Respuesta)
// ==========================================
export interface CampaniaDTO {
  id_campania_email: number;
  nombre: string;
  asunto: string;
  contenido_mensaje: string;
  contenido_secundario?: string | null;
  enlaces?: EnlaceDTO[] | null;
  estado: EstadoCampania;
  fecha_creacion: string;
  fecha_programada: string | null;
  destinatarios?: CampaniaDestinatarioDTO[];
}

// ==========================================
// 5. PAYLOADS DE PETICIÓN (REQUEST)
// ==========================================
export interface CampaniaCreateDTO {
  nombre: string;
  asunto: string;
  contenido_mensaje: string;
  contenido_secundario?: string | null;
  enlaces?: EnlaceDTO[] | null;
  fecha_programada?: string | null; // ISO string para programación diferida
  destinatarios_ids?: number[] | null; // Array de IDs de estudiantes destinatarios
}

export interface CampaniaUpdateDTO {
  nombre?: string | null;
  asunto?: string | null;
  contenido_mensaje?: string | null;
  contenido_secundario?: string | null;
  enlaces?: EnlaceDTO[] | null;
  fecha_programada?: string | null;
  agregar_destinatarios?: number[] | null;   // IDs nuevos a añadir
  eliminar_destinatarios?: number[] | null;  // IDs a remover de la campaña
}

export interface CampaniaEstadoUpdateDTO {
  estado: EstadoCampania;
}

// ==========================================
// 6. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface CampaniaResponse {
  success?: boolean;
  data: CampaniaDTO;
  message: string;
}

export interface PaginatedCampaniaResponse {
  success?: boolean;
  data: {
    items: CampaniaDTO[];
    meta: PaginationMeta;
  };
  message: string;
}