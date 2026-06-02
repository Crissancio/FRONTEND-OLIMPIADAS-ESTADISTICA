import { defineStore } from 'pinia';
import { ref } from 'vue';
import { emailLogsService } from '../services/email-logs.service';
import type {
  EmailLogDTO,
  EmailLogCompletoDTO,
  EmailLogFilters
} from '../types/email-logs.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useEmailLogsStore = defineStore('emailLogs', () => {
  // Estado
  const logs = ref<EmailLogDTO[]>([]);
  const currentLog = ref<EmailLogCompletoDTO | null>(null); // Detalle profundo para inspección
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Helper local para mutación optimista / reactiva en la grilla
  function updateLocalItem(updatedItem: EmailLogDTO) {
    const index = logs.value.findIndex(l => l.id_email_log === updatedItem.id_email_log);
    if (index !== -1) {
      logs.value[index] = updatedItem;
    }
    if (currentLog.value?.id_email_log === updatedItem.id_email_log) {
      currentLog.value = { ...currentLog.value, ...updatedItem };
    }
  }

  // ---- ACCIONES ----

  async function fetchLogs(filters?: EmailLogFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await emailLogsService.listarLogs(filters);
      logs.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLogById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await emailLogsService.obtenerLogPorId(id);
      currentLog.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function retrySingleEmail(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await emailLogsService.reintentarLogIndividual(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function retryAllFailedEmails() {
    loading.value = true;
    error.value = null;
    try {
      const response = await emailLogsService.reintentarTodosLosFallidos();
      // Como altera masivamente los estados, se recomienda refrescar la lista actual
      return response;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentLog() {
    currentLog.value = null;
  }

  return {
    logs,
    currentLog,
    loading,
    error,
    meta,
    fetchLogs,
    fetchLogById,
    retrySingleEmail,
    retryAllFailedEmails,
    clearCurrentLog
  };
});