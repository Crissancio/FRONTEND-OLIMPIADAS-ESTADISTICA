import { customInstance } from '@/app/api/mutator';
import type {
  AuditoriaFilters,
  ExportarAuditoriaCsvParams,
  BasePaginationParams,
  PaginatedAuditoriaResponse,
  PaginatedActividadSistemaResponse,
  AdminDashboardResponse,
  PaginatedActividadRecienteResponse,
  PaginatedEventoProximoResponse
} from '../types/sistema.api';

export const sistemaService = {
  listarAuditoria(params?: AuditoriaFilters) {
    return customInstance<PaginatedAuditoriaResponse>({
      url: '/api/v1/sistema/auditoria',
      method: 'GET',
      params
    });
  },

  exportarAuditoriaCsv(params: ExportarAuditoriaCsvParams) {
    return customInstance<Blob>({ // Generalmente se maneja como Blob
      url: '/api/v1/sistema/auditoria/exportar/csv',
      method: 'GET',
      params,
      responseType: 'blob' // Clave para descargar archivos en Axios
    });
  },

  listarActividades(params?: BasePaginationParams) {
    return customInstance<PaginatedActividadSistemaResponse>({
      url: '/api/v1/sistema/actividades',
      method: 'GET',
      params
    });
  },

  obtenerDashboardAdmin() {
    return customInstance<AdminDashboardResponse>({
      url: '/api/v1/sistema/admin-dashboard',
      method: 'GET'
    });
  },

  obtenerActividadReciente(params?: BasePaginationParams) {
    return customInstance<PaginatedActividadRecienteResponse>({
      url: '/api/v1/sistema/actividad-reciente',
      method: 'GET',
      params
    });
  },

  obtenerEventosProximos(params?: BasePaginationParams) {
    return customInstance<PaginatedEventoProximoResponse>({
      url: '/api/v1/sistema/eventos-proximos',
      method: 'GET',
      params
    });
  }
};