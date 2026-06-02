import { customInstance } from '@/app/api/mutator';
import type {
  EmailLogFilters,
  PaginatedEmailLogResponse,
  EmailLogCompletoResponse,
  EmailLogResponse
} from '../types/email-logs.api';

export const emailLogsService = {
  listarLogs(params?: EmailLogFilters) {
    return customInstance<PaginatedEmailLogResponse>({
      url: '/api/v1/email-logs/',
      method: 'GET',
      params
    });
  },

  obtenerLogPorId(id: number) {
    return customInstance<EmailLogCompletoResponse>({
      url: `/api/v1/email-logs/${id}`,
      method: 'GET'
    });
  },

  reintentarLogIndividual(id: number) {
    return customInstance<EmailLogResponse>({
      url: `/api/v1/email-logs/${id}/reintentar`,
      method: 'POST'
    });
  },

  reintentarTodosLosFallidos() {
    return customInstance<unknown>({
      url: '/api/v1/email-logs/reintentar-fallidos',
      method: 'POST'
    });
  }
};