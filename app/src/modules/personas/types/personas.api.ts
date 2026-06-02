import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoPersona = 'ACTIVO' | 'INACTIVO';

export type TipoColaborador = 
  | 'PERSONAL ACADEMICO' 
  | 'ADMINISTRATIVO' 
  | 'COLABORADOR';

// ==========================================
// 2. PARÁMETROS DE FILTRADO
// ==========================================
export interface DirectorFilters {
  page?: number;
  limit?: number;
}

export interface ColaboradorFilters {
  page?: number;
  limit?: number;
  nombre?: string | null;
  correo?: string | null;
  tipo?: TipoColaborador | null;
  rol?: string | null;
  estado?: EstadoPersona | null;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs de Respuesta)
// ==========================================
export interface DirectorDTO {
  id_director: number;
  id_colegio?: number | null;
  nombres: string;
  paterno: string;
  materno?: string | null;
  telefono_1?: string | null;
  telefono_2?: string | null;
  estado?: EstadoPersona | null;
}

export interface DirectorMinifiedDTO {
  id_director: number;
  nombres_completos: string;
}

export interface ColaboradorDTO {
  id_colaborador: number;
  nombres: string;
  paterno: string;
  materno?: string | null;
  rol: string;
  tipo: TipoColaborador;
  correo: string;
  presentacion?: string | null;
  perfil?: string | null; // URL de la imagen
  estado: EstadoPersona;
}

// ==========================================
// 4. PAYLOADS DE PETICIÓN (REQUEST)
// ==========================================
export interface DirectorCreateDTO {
  id_colegio?: number | null;
  telefono_1?: string | null;
  telefono_2?: string | null;
  nombres: string;
  paterno: string;
  materno?: string | null;
}

export interface DirectorUpdateDTO {
  id_colegio?: number | null;
  telefono_1?: string | null;
  telefono_2?: string | null;
  nombres?: string | null;
  paterno?: string | null;
  materno?: string | null;
}

export interface ColaboradorCreateDTO {
  nombres: string;
  paterno: string;
  materno?: string | null;
  rol: string;
  tipo: TipoColaborador;
  correo: string;
  presentacion?: string | null;
  perfil?: Blob | null; // Archivo de imagen
}

export interface ColaboradorUpdateDTO {
  nombres?: string | null;
  paterno?: string | null;
  materno?: string | null;
  rol?: string | null;
  tipo?: TipoColaborador | null;
  correo?: string | null;
  presentacion?: string | null;
  perfil?: Blob | null; // Archivo de imagen
}

// ==========================================
// 5. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface PaginatedDirectorResponse {
  success?: boolean;
  data: {
    items: DirectorDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface PaginatedColaboradorResponse {
  success?: boolean;
  data: {
    items: ColaboradorDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface DirectorResponse {
  success?: boolean;
  data: DirectorDTO;
  message: string;
}

export interface DirectorMinifiedListResponse {
  success?: boolean;
  data: DirectorMinifiedDTO[];
  message: string;
}

export interface ColaboradorResponse {
  success?: boolean;
  data: ColaboradorDTO;
  message: string;
}

export interface GeneralDictResponse {
  success?: boolean;
  data: Record<string, unknown>;
  message: string;
}