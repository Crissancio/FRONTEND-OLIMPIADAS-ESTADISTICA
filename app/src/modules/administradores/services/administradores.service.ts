import { customInstance } from '@/app/api/mutator';
import type {
  AdministradorFilters,
  PaginatedAdministradorResponse,
  AdministradorCreateDTO,
  AdministradorResponse,
  AdministradorUpdateDTO
} from '../types/administradores.api';

export const administradoresService = {
  listarAdministradores(params?: AdministradorFilters) {
    return customInstance<PaginatedAdministradorResponse>({
      url: '/api/v1/administradores',
      method: 'GET',
      params
    });
  },

  crearAdministrador(data: AdministradorCreateDTO) {
    return customInstance<AdministradorResponse>({
      url: '/api/v1/administradores',
      method: 'POST',
      data
    });
  },

  obtenerAdministradorPorId(id: number) {
    return customInstance<AdministradorResponse>({
      url: `/api/v1/administradores/${id}`,
      method: 'GET'
    });
  },

  actualizarAdministrador(id: number, data: AdministradorUpdateDTO) {
    return customInstance<AdministradorResponse>({
      url: `/api/v1/administradores/${id}`,
      method: 'PUT',
      data
    });
  },

  eliminarAdministrador(id: number) {
    return customInstance<AdministradorResponse>({
      url: `/api/v1/administradores/${id}`,
      method: 'DELETE'
    });
  },

  bajaLogicaAdministrador(id: number) {
    return customInstance<AdministradorResponse>({
      url: `/api/v1/administradores/${id}/baja`,
      method: 'PATCH'
    });
  },

  altaLogicaAdministrador(id: number) {
    return customInstance<AdministradorResponse>({
      url: `/api/v1/administradores/${id}/alta`,
      method: 'PATCH'
    });
  }
};

export const AdministradoresService = {
  list: administradoresService.listarAdministradores,
  create: administradoresService.crearAdministrador,
  getById: administradoresService.obtenerAdministradorPorId,
  update: administradoresService.actualizarAdministrador,
  remove: administradoresService.eliminarAdministrador,
  baja: administradoresService.bajaLogicaAdministrador,
  alta: administradoresService.altaLogicaAdministrador,
};
