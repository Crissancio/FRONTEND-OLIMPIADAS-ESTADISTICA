import { customInstance } from '@/app/api/mutator';
import type {
  DirectorFilters,
  ColaboradorFilters,
  PaginatedDirectorResponse,
  PaginatedColaboradorResponse,
  DirectorCreateDTO,
  DirectorUpdateDTO,
  ColaboradorCreateDTO,
  ColaboradorUpdateDTO,
  DirectorResponse,
  ColaboradorResponse,
  DirectorMinifiedListResponse,
  GeneralDictResponse
} from '../types/personas.api';

export const personasService = {
  // ==========================================
  // MÓDULO: DIRECTORES
  // ==========================================
  listarDirectores(params?: DirectorFilters) {
    return customInstance<PaginatedDirectorResponse>({
      url: '/api/v1/personas/directores',
      method: 'GET',
      params
    });
  },

  listarDirectoresCorta() {
    return customInstance<DirectorMinifiedListResponse>({
      url: '/api/v1/personas/directores/lista-corta',
      method: 'GET'
    });
  },

  obtenerDirectorPorId(id: number) {
    return customInstance<DirectorResponse>({
      url: `/api/v1/personas/directores/${id}`,
      method: 'GET'
    });
  },

  crearDirector(data: DirectorCreateDTO) {
    return customInstance<DirectorResponse>({
      url: '/api/v1/personas/directores',
      method: 'POST',
      data
    });
  },

  actualizarDirector(id: number, data: DirectorUpdateDTO) {
    return customInstance<DirectorResponse>({
      url: `/api/v1/personas/directores/${id}`,
      method: 'PUT',
      data
    });
  },

  eliminarDirector(id: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/personas/directores/${id}`,
      method: 'DELETE'
    });
  },

  bajaLogicaDirector(id: number) {
    return customInstance<DirectorResponse>({
      url: `/api/v1/personas/directores/${id}/baja`,
      method: 'PATCH'
    });
  },

  altaLogicaDirector(id: number) {
    return customInstance<DirectorResponse>({
      url: `/api/v1/personas/directores/${id}/alta`,
      method: 'PATCH'
    });
  },

  // ==========================================
  // MÓDULO: COLABORADORES
  // ==========================================
  listarColaboradores(params?: ColaboradorFilters) {
    return customInstance<PaginatedColaboradorResponse>({
      url: '/api/v1/personas/colaboradores',
      method: 'GET',
      params
    });
  },

  obtenerColaboradorPorId(id: number) {
    return customInstance<ColaboradorResponse>({
      url: `/api/v1/personas/colaboradores/${id}`,
      method: 'GET'
    });
  },

  crearColaborador(data: ColaboradorCreateDTO) {
    const formData = new FormData();
    formData.append('nombres', data.nombres);
    formData.append('paterno', data.paterno);
    if (data.materno) formData.append('materno', data.materno);
    formData.append('rol', data.rol);
    formData.append('tipo', data.tipo);
    formData.append('correo', data.correo);
    if (data.presentacion) formData.append('presentacion', data.presentacion);
    if (data.perfil) formData.append('perfil', data.perfil);

    return customInstance<ColaboradorResponse>({
      url: '/api/v1/personas/colaboradores',
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    });
  },

  actualizarColaborador(id: number, data: ColaboradorUpdateDTO) {
    const formData = new FormData();
    if (data.nombres !== undefined && data.nombres !== null) formData.append('nombres', data.nombres);
    if (data.paterno !== undefined && data.paterno !== null) formData.append('paterno', data.paterno);
    if (data.materno !== undefined && data.materno !== null) formData.append('materno', data.materno);
    if (data.rol !== undefined && data.rol !== null) formData.append('rol', data.rol);
    if (data.tipo !== undefined && data.tipo !== null) formData.append('tipo', data.tipo);
    if (data.correo !== undefined && data.correo !== null) formData.append('correo', data.correo);
    if (data.presentacion !== undefined && data.presentacion !== null) formData.append('presentacion', data.presentacion);
    if (data.perfil !== undefined && data.perfil !== null) formData.append('perfil', data.perfil);

    return customInstance<ColaboradorResponse>({
      url: `/api/v1/personas/colaboradores/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    });
  },

  eliminarColaborador(id: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/personas/colaboradores/${id}`,
      method: 'DELETE'
    });
  },

  bajaColaborador(id: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/personas/colaboradores/${id}/baja`,
      method: 'PATCH'
    });
  },

  altaColaborador(id: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/personas/colaboradores/${id}/alta`,
      method: 'PATCH'
    });
  }
};