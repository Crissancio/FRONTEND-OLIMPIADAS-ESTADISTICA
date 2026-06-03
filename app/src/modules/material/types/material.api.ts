import type { PaginationMeta } from '@/shared/types/api.types';

export type TipoMaterialEnum = 
  | 'VIDEO' | 'EXAMEN' | 'SOLUCIONARIO' | 'EJERCICIOS' | 'DOCUMENTO' 
  | 'AFICHE' | 'CONVOCATORIA' | 'REGLAMENTO' | 'DOCUMENTO_EXTERNO' 
  | 'ARCHIVO_EXTERNO' | 'PAGINA_EXTERNA' | 'VIDEO_EXTERNO' | 'OTRO';

export type EstadoMaterial = 'BORRADOR' | 'PUBLICO' | 'OCULTO';

export type EstadoTemporalMaterial = 'BORRADOR' | 'OCULTO' | 'VISIBLE' | 'NO_VISIBLE';
export interface MaterialFilters {
  page?: number;
  limit?: number;
  estado?: EstadoMaterial | null;
  tipo_material?: TipoMaterialEnum | null;
  busqueda?: string | null;
  
  fc_start?: string | null;
  fc_end?: string | null;
  fa_start?: string | null;
  fa_end?: string | null;
  fp_start?: string | null;
  fp_end?: string | null;
}

export interface RelacionConvocatoriaDTO {
  id_convocatoria: number;
  nombre_convocatoria: string;
  gestion: number;
}

export interface RelacionFaseDTO {
  id_fase: number;
  nombre_fase: string;
  nombre_categoria: string;
}

export interface MaterialDTO {
  id_material: number;
  nombre_material: string;
  enlace_acceso: string;
  descripcion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: EstadoMaterial;
  estado_temporal: EstadoTemporalMaterial;
  tipo_material: TipoMaterialEnum;
  fecha_publicacion: string | null;
}

export interface MaterialDetalleDTO extends MaterialDTO {
  convocatorias?: RelacionConvocatoriaDTO[];
  fases?: RelacionFaseDTO[];
}

export interface MaterialExternoCreateDTO {
  nombre_material: string;
  descripcion?: string | null;
  tipo_material: TipoMaterialEnum;
  fecha_publicacion?: string | null;
  enlace_acceso: string;
}

export interface MaterialArchivoCreateDTO {
  nombre_material: string;
  descripcion?: string | null;
  tipo_material: TipoMaterialEnum;
  fecha_publicacion?: string | null;
  file: Blob;
}

export interface MaterialPrincipalCreateDTO {
  id_convocatoria: number;
  tipo_material: TipoMaterialEnum;
  nombre_material: string;
  descripcion?: string | null;
  file: Blob;
}

export interface MaterialUpdateDTO {
  nombre_material?: string | null;
  descripcion?: string | null;
  tipo_material?: TipoMaterialEnum | null;
  fecha_publicacion?: string | null;
  enlace_acceso?: string | null;
}

export interface PaginatedMaterialResponse {
  success?: boolean;
  data: {
    items: MaterialDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface MaterialResponse {
  success?: boolean;
  data: MaterialDTO;
  message: string;
}

export interface MaterialListResponse {
  success?: boolean;
  data: MaterialDTO[];
  message: string;
}

export interface MaterialDetalleResponse {
  success?: boolean;
  data: MaterialDetalleDTO;
  message: string;
}

export interface GeneralDictResponse {
  success?: boolean;
  data: Record<string, unknown>;
  message: string;
}

export type TipoMaterialPrincipal = 'AFICHE' | 'CONVOCATORIA' | 'REGLAMENTO' ;
export interface MaterialPrincipalPorTipo{
  id_material: number;
  nombre_material: string;
  enlace_acceso: string;
}

export interface MaterialPrincipalPorTipoResponse{
  success?: boolean;
  data: MaterialPrincipalPorTipo;
  message: string;
}