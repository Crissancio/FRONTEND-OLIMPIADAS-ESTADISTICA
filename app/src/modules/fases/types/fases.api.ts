import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoEntidad = 'BORRADOR' | 'LISTA' | 'ELIMINADA';
export type ModalidadFase = 'VIRTUAL' | 'PRESENCIAL' | 'SEMIPRESENCIAL';
export type TipoFase = 'PREPARACION' | 'PRUEBA';

// ==========================================
// 2. PARÁMETROS DE BÚSQUEDA (FILTROS)
// ==========================================
export interface FaseFilters {
  page?: number;
  limit?: number;
}

// ==========================================
// 3. ENTIDADES (DTOs de Respuesta)
// ==========================================

// Propiedades comunes a cualquier fase
export interface FaseBaseDTO {
  id_fase: number;
  id_categoria_fk: number;
  nombre_fase: string;
  descripcion?: string | null;
  modalidad: ModalidadFase;
  estado: EstadoEntidad;
}

// Fase Específica de Preparación
export interface FasePreparacionDTO extends FaseBaseDTO {
  tipo_fase: 'PREPARACION';
  fecha_inicio: string;
  fecha_fin: string;
}

// Fase Específica de Prueba
export interface FasePruebaDTO extends FaseBaseDTO {
  tipo_fase: 'PRUEBA';
  id_fase_anterior?: number | null;
  criterio_aprobacion: number; // Mínimo 0
  fecha_realizacion: string;
  lugar_realizacion?: string | null;
  es_prueba_final?: boolean;
}

// Unión para las listas mezcladas
export type FaseUnionDTO = FasePreparacionDTO | FasePruebaDTO;

export interface FaseMinifiedDTO {
  id_fase: number;
  nombre_fase: string;
}

// ==========================================
// 4. PAYLOADS PARA CREAR/ACTUALIZAR
// ==========================================
export interface FasePreparacionCreateDTO {
  id_categoria_fk: number;
  nombre_fase: string;
  descripcion?: string | null;
  modalidad: ModalidadFase;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface FasePreparacionUpdateDTO {
  nombre_fase?: string | null;
  descripcion?: string | null;
  modalidad?: ModalidadFase | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

export interface FasePruebaCreateDTO {
  id_categoria_fk: number;
  nombre_fase: string;
  descripcion?: string | null;
  modalidad: ModalidadFase;
  id_fase_anterior?: number | null;
  criterio_aprobacion: number;
  fecha_realizacion: string;
  lugar_realizacion?: string | null;
  es_prueba_final?: boolean;
}

export interface FasePruebaUpdateDTO {
  nombre_fase?: string | null;
  descripcion?: string | null;
  modalidad?: ModalidadFase | null;
  id_fase_anterior?: number | null;
  criterio_aprobacion?: number | null;
  fecha_realizacion?: string | null;
  lugar_realizacion?: string | null;
  es_prueba_final?: boolean | null;
}

export interface FaseEstadoUpdateDTO {
  estado: EstadoEntidad;
}

// ==========================================
// 5. RESPUESTAS DE LA API (Wrappers)
// ==========================================
export interface PaginatedFaseUnionResponse {
  success?: boolean;
  data: {
    items: FaseUnionDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface FaseUnionResponse {
  success?: boolean;
  data: FaseUnionDTO;
  message: string;
}

export interface FasePreparacionResponse {
  success?: boolean;
  data: FasePreparacionDTO;
  message: string;
}

export interface FasePruebaResponse {
  success?: boolean;
  data: FasePruebaDTO;
  message: string;
}

export interface ListaFaseMinifiedResponse {
  success?: boolean;
  data: FaseMinifiedDTO[];
  message: string;
}