import type { PaginationMeta } from '@/shared/types/api.types';
import type { AvisoPrioridad, TipoAviso } from '@/modules/avisos/types/avisos.api';
import type { EstadoTemporal } from '@/modules/convocatorias/types/convocatorias.api';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type TipoColaborador = 'PERSONAL ACADEMICO' | 'ADMINISTRATIVO' | 'COLABORADOR';

export type TipoMaterialEnum = 
  | 'EXAMEN' | 'SOLUCIONARIO' | 'EJERCICIOS' | 'DOCUMENTO' | 'AFICHE' 
  | 'CONVOCATORIA' | 'REGLAMENTO' | 'DOCUMENTO_EXTERNO' | 'ARCHIVO_EXTERNO' 
  | 'PAGINA_EXTERNA' | 'VIDEO_EXTERNO' | 'OTRO';

export type TurnoColegio = 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MIXTO';

// ==========================================
// 2. PARÁMETROS DE FILTRADO
// ==========================================
export interface GetAvisosPublicosParams {
  page?: number;
  limit?: number;
}

export interface GetColaboradoresPublicParams {
  tipo: TipoColaborador;
  page?: number;
  limit?: number;
}

export interface GetMaterialesPublicParams {
  page?: number;
  limit?: number;
  tipo_material?: TipoMaterialEnum | null;
  fecha_start?: string | null;
  fecha_end?: string | null;
  busqueda?: string | null;
}

export interface GetResultadosFinalesPublicParams {
  page?: number;
  limit?: number;
  id_convocatoria?: number | null;
  id_categoria?: number | null;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs)
// ==========================================
// -- Colaboradores --
export interface PublicColaboradorResponseDTO {
  nombres: string;
  paterno: string;
  materno: string | null;
  perfil: string | null;
  presentacion: string | null;
  rol: string;
  correo: string;
}

// -- Colegios --
export interface ColegioPublicoMinifiedDTO {
  id_colegio: number;
  nombre: string;
  municipio: string;
  turno: TurnoColegio;
}

// -- Materiales --
export interface MaterialPublicoDTO {
  nombre: string;
  enlace_acceso: string;
}

export interface MaterialPublicoGeneralDTO {
  nombre_material: string;
  enlace_acceso: string;
  descripcion?: string | null;
  fecha_publicacion?: string | null;
}

export interface MaterialPublicoRelacionDTO {
  nombre_material: string;
  descripcion?: string | null;
  enlace_acceso: string;
  tipo_material: TipoMaterialEnum;
}

export interface MaterialesDetalleDTO {
  afiche?: MaterialPublicoDTO | null;
  convocatoria?: MaterialPublicoDTO | null;
  reglamento?: MaterialPublicoDTO | null;
}

export interface MaterialesInicioDTO {
  afiche?: MaterialPublicoDTO | null;
  convocatoria?: MaterialPublicoDTO | null;
}

// -- Resultados --
export interface ResultadoPublicoGeneralDTO {
  nombres: string;
  paterno: string;
  materno: string;
  carnet_identidad: string;
  nota: number;
}

export interface ResultadoPublicoFaseDTO {
  carnet_identidad: string;
  nota: number;
  observaciones?: string | null;
}

// -- Fases --
export interface FasePreparacionPublicaDTO {
  id_fase: number;
  nombre_fase: string;
  descripcion?: string | null;
  modalidad: string;
  tipo_fase: 'PREPARACION';
  fecha_inicio: string;
  fecha_fin: string;
}

export interface FasePruebaPublicaDTO {
  id_fase: number;
  nombre_fase: string;
  descripcion?: string | null;
  modalidad: string;
  tipo_fase: 'PRUEBA';
  fecha_realizacion: string;
  lugar_realizacion?: string | null;
  criterio_aprobacion: number;
}

export type FasePublicaUnionDTO = FasePruebaPublicaDTO | FasePreparacionPublicaDTO;

// -- Avisos --
export interface AvisoPublicoDTO {
  prioridad: AvisoPrioridad;
  titulo: string;
  descripcion: string;
  tipo: TipoAviso;
}

// -- Categorías --
export interface CategoriaDetalleDTO {
  nombre_categoria: string;
  curso: string;
  nivel: string;
  id_categoria: number;
}

export interface CategoriaInicioDTO {
  nombre_categoria: string;
  curso: string;
  nivel: string;
}

// -- Convocatorias --
export interface ConvocatoriaIdDTO {
  id_convocatoria: number;
}

export interface ConvocatoriaMinified {
  id_convocatoria: number;
  nombre_convocatoria: string;
  gestion: number;
}

export interface ConvocatoriaListPublicDTO {
  id_convocatoria: number;
  nombre_convocatoria: string;
  gestion: number;
  descripcion?: string | null;
  inicio_olimpiadas?: string | null;
  fin_olimpiadas?: string | null;
}

export interface ConvocatoriaInicioDTO {
  id_convocatoria: number;
  nombre_convocatoria: string;
  gestion: number;
  descripcion?: string | null;
  estado_temporal: EstadoTemporal;
  monto_inscripcion?: string | null;
  inicio_olimpiadas?: string | null;
  fin_olimpiadas?: string | null;
  categorias?: CategoriaInicioDTO[];
  material_principal: MaterialesInicioDTO;
}

export interface ConvocatoriaDetalleDTO {
  id_convocatoria: number;
  nombre_convocatoria: string;
  gestion: number;
  descripcion?: string | null;
  estado_temporal: EstadoTemporal;
  monto_inscripcion?: string | null;
  inicio_olimpiadas?: string | null;
  fin_olimpiadas?: string | null;
  fecha_inicio_inscripcion?: string | null;
  fecha_fin_inscripcion?: string | null;
  categorias?: CategoriaDetalleDTO[];
  material_principal: MaterialesDetalleDTO;
}

// ==========================================
// 4. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface PaginatedResponse<T> {
  success?: boolean;
  data: {
    items: T[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface BaseResponse<T> {
  success?: boolean;
  data: T;
  message: string;
}
