import { customInstance } from '@/app/api/mutator';
import type {
  AvisoFilters,
  PaginatedAvisoResponse,
  AvisoResponse,
  AvisoCreateDTO,
  AvisoUpdateDTO,
  AvisoEstadoUpdateDTO
} from '../types/avisos.api';

export const avisosService = {
  // ================= LECTURA: PÚBLICA =================
  listarAvisosPublicos(params?: AvisoFilters) {
    return customInstance<PaginatedAvisoResponse>({
      url: '/api/v1/avisos',
      method: 'GET',
      params
    });
  },

  obtenerAvisoPublico(avisoId: number) {
    return customInstance<AvisoResponse>({
      url: `/api/v1/avisos/${avisoId}`,
      method: 'GET'
    });
  },

  // ================= LECTURA: ADMIN =================
  listarAvisosAdmin(params?: AvisoFilters) {
    return customInstance<PaginatedAvisoResponse>({
      url: '/api/v1/avisos/admin',
      method: 'GET',
      params
    });
  },

  obtenerAvisoAdmin(avisoId: number) {
    return customInstance<AvisoResponse>({
      url: `/api/v1/avisos/admin/${avisoId}`,
      method: 'GET'
    });
  },

  // ================= ESCRITURA (ADMIN) =================
  crearAviso(data: AvisoCreateDTO) {
    return customInstance<AvisoResponse>({
      url: '/api/v1/avisos',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  actualizarAviso(avisoId: number, data: AvisoUpdateDTO) {
    return customInstance<AvisoResponse>({
      url: `/api/v1/avisos/${avisoId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  cambiarEstadoAviso(avisoId: number, data: AvisoEstadoUpdateDTO) {
    return customInstance<AvisoResponse>({
      url: `/api/v1/avisos/${avisoId}/estado`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  eliminarAviso(avisoId: number) {
    return customInstance<AvisoResponse>({
      url: `/api/v1/avisos/${avisoId}`,
      method: 'DELETE'
    });
  }
};