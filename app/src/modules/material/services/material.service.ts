import { customInstance } from '@/app/api/mutator';
import type {
  MaterialFilters,
  PaginatedMaterialResponse,
  MaterialListResponse,
  MaterialResponse,
  MaterialDetalleResponse,
  MaterialExternoCreateDTO,
  MaterialArchivoCreateDTO,
  MaterialPrincipalCreateDTO,
  MaterialUpdateDTO,
  TipoMaterialEnum,
  GeneralDictResponse,
  MaterialPrincipalPorTipoResponse,
  TipoMaterialPrincipal
} from '../types/material.api';

export const materialesService = {
  listarMateriales(params?: MaterialFilters) {
    return customInstance<PaginatedMaterialResponse>({
      url: '/api/v1/materiales',
      method: 'GET',
      params
    });
  },

  obtenerPorConvocatoria(idConvocatoria: number) {
    return customInstance<MaterialListResponse>({
      url: `/api/v1/materiales/convocatoria/${idConvocatoria}`,
      method: 'GET'
    });
  },

  obtenerPorFase(idFase: number) {
    return customInstance<MaterialListResponse>({
      url: `/api/v1/materiales/fase/${idFase}`,
      method: 'GET'
    });
  },

  obtenerPrincipal(idConvocatoria: number, tipo: TipoMaterialEnum) {
    return customInstance<MaterialResponse>({
      url: `/api/v1/materiales/convocatoria/${idConvocatoria}/principal/${tipo}`,
      method: 'GET'
    });
  },

  obtenerMaterialPorId(idMaterial: number) {
    return customInstance<MaterialDetalleResponse>({
      url: `/api/v1/materiales/${idMaterial}`,
      method: 'GET'
    });
  },

  crearMaterialExterno(data: MaterialExternoCreateDTO) {
    return customInstance<MaterialResponse>({
      url: '/api/v1/materiales/externo',
      method: 'POST',
      data
    });
  },

  crearMaterialArchivo(data: MaterialArchivoCreateDTO) {
    const formData = new FormData();
    formData.append('nombre_material', data.nombre_material);
    formData.append('tipo_material', data.tipo_material);
    formData.append('file', data.file);
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.fecha_publicacion) formData.append('fecha_publicacion', data.fecha_publicacion);

    return customInstance<MaterialResponse>({
      url: '/api/v1/materiales/archivo',
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    });
  },

  crearMaterialPrincipal(data: MaterialPrincipalCreateDTO) {
    const formData = new FormData();
    formData.append('id_convocatoria', data.id_convocatoria.toString());
    formData.append('nombre_material', data.nombre_material);
    formData.append('tipo_material', data.tipo_material);
    formData.append('file', data.file);
    if (data.descripcion) formData.append('descripcion', data.descripcion);

    return customInstance<MaterialResponse>({
      url: '/api/v1/materiales/principal',
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    });
  },

  actualizarMaterial(idMaterial: number, data: MaterialUpdateDTO) {
    return customInstance<MaterialResponse>({
      url: `/api/v1/materiales/${idMaterial}`,
      method: 'PUT',
      data
    });
  },

  publicarMaterial(idMaterial: number) {
    return customInstance<MaterialResponse>({
      url: `/api/v1/materiales/${idMaterial}/publicar`,
      method: 'PUT'
    });
  },

  ocultarMaterial(idMaterial: number) {
    return customInstance<MaterialResponse>({
      url: `/api/v1/materiales/${idMaterial}/ocultar`,
      method: 'PUT'
    });
  },

  eliminarMaterial(idMaterial: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/materiales/${idMaterial}`,
      method: 'DELETE'
    });
  },

  ligarConvocatoria(idMaterial: number, idConvocatoria: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/materiales/${idMaterial}/convocatoria/${idConvocatoria}`,
      method: 'POST'
    });
  },

  desligarConvocatoria(idMaterial: number, idConvocatoria: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/materiales/${idMaterial}/convocatoria/${idConvocatoria}`,
      method: 'DELETE'
    });
  },

  ligarFase(idMaterial: number, idFase: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/materiales/${idMaterial}/fase/${idFase}`,
      method: 'POST'
    });
  },

  desligarFase(idMaterial: number, idFase: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/materiales/${idMaterial}/fase/${idFase}`,
      method: 'DELETE'
    });
  },

  conseguirMaterialPrincipalTipo(tipo: TipoMaterialPrincipal) {
    return customInstance<MaterialPrincipalPorTipoResponse>({
      url: `/api/v1/materiales/principal/${tipo}`,
      method: 'GET'
    })
  }
};