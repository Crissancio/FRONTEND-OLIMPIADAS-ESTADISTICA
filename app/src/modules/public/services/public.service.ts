import { customInstance } from '@/app/api/mutator';
import type {
  GetColaboradoresPublicParams,
  GetMaterialesPublicParams,
  GetResultadosFinalesPublicParams,
  GetAvisosPublicosParams,
  PaginatedResponse,
  BaseResponse,
  PublicColaboradorResponseDTO,
  ColegioPublicoMinifiedDTO,
  MaterialPublicoGeneralDTO,
  MaterialPublicoRelacionDTO,
  ResultadoPublicoGeneralDTO,
  ResultadoPublicoFaseDTO,
  FasePublicaUnionDTO,
  AvisoPublicoDTO,
  ConvocatoriaIdDTO,
  ConvocatoriaInicioDTO,
  ConvocatoriaDetalleDTO,
  ConvocatoriaListPublicDTO,
  CategoriaDetalleDTO,
  ConvocatoriaMinified
} from '../types/public.api';

export const publicService = {
  // ================= COLABORADORES Y COLEGIOS =================
  obtenerColaboradores(params: GetColaboradoresPublicParams) {
    return customInstance<PaginatedResponse<PublicColaboradorResponseDTO>>({
      url: `/api/public/v1/public/colaboradores`, method: 'GET', params
    });
  },
  obtenerColegiosMinified() {
    return customInstance<BaseResponse<ColegioPublicoMinifiedDTO[]>>({
      url: `/api/public/v1/public/colegios-minified`, method: 'GET'
    });
  },

  // ================= MATERIALES =================
  obtenerMateriales(params?: GetMaterialesPublicParams) {
    return customInstance<PaginatedResponse<MaterialPublicoGeneralDTO>>({
      url: `/api/public/v1/public/materiales`, method: 'GET', params
    });
  },
  obtenerMaterialesPorFase(idFase: number) {
    return customInstance<BaseResponse<MaterialPublicoRelacionDTO[]>>({
      url: `/api/public/v1/public/fase/${idFase}/materiales`, method: 'GET'
    });
  },
  obtenerMaterialesPorConvocatoria(idConvocatoria: number) {
    return customInstance<BaseResponse<MaterialPublicoRelacionDTO[]>>({
      url: `/api/public/v1/public/convocatoria/${idConvocatoria}/materiales`, method: 'GET'
    });
  },

  // ================= RESULTADOS Y FASES =================
  obtenerResultadosFinales(params?: GetResultadosFinalesPublicParams) {
    return customInstance<PaginatedResponse<ResultadoPublicoGeneralDTO>>({
      url: `/api/public/v1/public/resultados`, method: 'GET', params
    });
  },
  obtenerResultadosPorFase(idFase: number) {
    return customInstance<BaseResponse<ResultadoPublicoFaseDTO[]>>({
      url: `/api/public/v1/public/fase/${idFase}/resultados`, method: 'GET'
    });
  },
  obtenerFasesPorCategoria(idCategoria: number) {
    return customInstance<BaseResponse<FasePublicaUnionDTO[]>>({
      url: `/api/public/v1/public/fases/${idCategoria}`, method: 'GET'
    });
  },

  // ================= AVISOS =================
  obtenerAvisos(params?: GetAvisosPublicosParams) {
    return customInstance<PaginatedResponse<AvisoPublicoDTO>>({
      url: `/api/public/v1/public/avisos-publicos`, method: 'GET', params
    });
  },

  // ================= CONVOCATORIAS E INICIO =================
  obtenerConvocatoriaPrincipalId() {
    return customInstance<BaseResponse<ConvocatoriaIdDTO>>({
      url: `/api/public/v1/public/convocatoria-principal`, method: 'GET'
    });
  },
  obtenerInicio() {
    return customInstance<BaseResponse<ConvocatoriaDetalleDTO>>({
      url: `/api/public/v1/public/inicio`, method: 'GET'
    });
  },
  obtenerConvocatoriaDetalle(idConvocatoria: number) {
    return customInstance<BaseResponse<ConvocatoriaDetalleDTO>>({
      url: `/api/public/v1/public/convocatoria/${idConvocatoria}/detalle`, method: 'GET'
    });
  },
  obtenerConvocatoriasList() {
    return customInstance<BaseResponse<ConvocatoriaListPublicDTO[]>>({
      url: `/api/public/v1/public/convocatorias`, method: 'GET'
    });
  },
  obtenerCategoriasPorConvocatoria(idConvocatoria: number) {
    return customInstance<BaseResponse<CategoriaDetalleDTO[]>>({
      url: `/api/public/v1/public${idConvocatoria}/categorias`, method: 'GET' // Ojo con la falta de barra en la ruta original, respeta lo que mandaste!
    });
  },
  obtenerConvocatoriasMinified() {
    return customInstance<BaseResponse<ConvocatoriaMinified[]>>({
      url: `/api/public/v1/public/convocatorias-minified`, method: 'GET'
    });
  }
};