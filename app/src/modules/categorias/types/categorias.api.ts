import type { PaginationMeta } from '@/shared/types/api.types';

export type NivelEducativo = 'PRIMARIA' | 'SECUNDARIA';
export type EstadoEntidad = 'BORRADOR' | 'LISTA' | 'ELIMINADA';

export interface CategoriaFilters {
  page?: number;
  limit?: number;
}
export interface CategoriaDTO {
  id_categoria: number;
  id_convocatoria: number;
  nombre_categoria: string;
  curso: number; // Mínimo 1, Máximo 6
  nivel: NivelEducativo;
  estado: EstadoEntidad;
}

export interface CategoriaCreateDTO {
  id_convocatoria: number;
  nombre_categoria: string;
  curso: number;
  nivel: NivelEducativo;
}

export interface CategoriaUpdateDTO {
  nombre_categoria?: string | null;
  curso?: number | null;
  nivel?: NivelEducativo | null;
}

export interface CategoriaEstadoUpdateDTO {
  estado: EstadoEntidad;
}

export interface CategoriaResponse {
  success?: boolean;
  data: CategoriaDTO;
  message: string;
}

export interface PaginatedCategoriaResponse {
  success?: boolean;
  data: {
    items: CategoriaDTO[];
    meta: PaginationMeta;
  };
  message: string;
}