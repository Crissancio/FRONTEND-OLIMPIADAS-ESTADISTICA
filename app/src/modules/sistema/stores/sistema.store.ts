import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sistemaService } from '../services/sistema.service';
import type { 
  AdminDashboardDTO, 
  AuditoriaDTO, 
  ActividadSistemaDTO, 
  ActividadRecienteDTO, 
  EventoProximoDTO,
  AuditoriaFilters,
  ExportarAuditoriaCsvParams,
  BasePaginationParams
} from '../types/sistema.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useSistemaStore = defineStore('sistema', () => {
  // ==============================
  // ESTADOS GENERALES
  // ==============================
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);

  // ==============================
  // ESTADOS DE DATOS
  // ==============================
  const dashboard = ref<AdminDashboardDTO | null>(null);
  
  const auditorias = ref<AuditoriaDTO[]>([]);
  const metaAuditoria = ref<PaginationMeta | null>(null);

  const actividadesSistema = ref<ActividadSistemaDTO[]>([]);
  const metaActividades = ref<PaginationMeta | null>(null);

  const actividadesRecientes = ref<ActividadRecienteDTO[]>([]);
  const metaActividadReciente = ref<PaginationMeta | null>(null);

  const eventosProximos = ref<EventoProximoDTO[]>([]);
  const metaEventosProximos = ref<PaginationMeta | null>(null);

  // ==============================
  // ACCIONES
  // ==============================
  async function fetchDashboard() {
    loading.value = true;
    error.value = null;
    try {
      const response = await sistemaService.obtenerDashboardAdmin();
      dashboard.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAuditoria(params?: AuditoriaFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sistemaService.listarAuditoria(params);
      auditorias.value = response.data.items;
      metaAuditoria.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function downloadAuditoriaCsv(params: ExportarAuditoriaCsvParams) {
    loading.value = true;
    error.value = null;
    try {
      const blob = await sistemaService.exportarAuditoriaCsv(params);
      
      // Lógica de navegador para forzar la descarga del Blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_${params.fecha_start}_${params.fecha_end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchActividadesSistema(params?: BasePaginationParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sistemaService.listarActividades(params);
      actividadesSistema.value = response.data.items;
      metaActividades.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

async function fetchActividadesRecientes(params?: BasePaginationParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sistemaService.obtenerActividadReciente(params);
      
      // SI LA PÁGINA ES MAYOR A 1, ACUMULAMOS LOS REGISTROS; SI NO, REEMPLAZAMOS
      if (params?.page && params.page > 1) {
        actividadesRecientes.value = [...actividadesRecientes.value, ...response.data.items];
      } else {
        actividadesRecientes.value = response.data.items;
      }
      
      metaActividadReciente.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEventosProximos(params?: BasePaginationParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sistemaService.obtenerEventosProximos(params);
      
      // SI LA PÁGINA ES MAYOR A 1, ACUMULAMOS LOS REGISTROS; SI NO, REEMPLAZAMOS
      if (params?.page && params.page > 1) {
        eventosProximos.value = [...eventosProximos.value, ...response.data.items];
      } else {
        eventosProximos.value = response.data.items;
      }
      
      metaEventosProximos.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  return {
    // States
    loading,
    error,
    dashboard,
    auditorias,
    metaAuditoria,
    actividadesSistema,
    metaActividades,
    actividadesRecientes,
    metaActividadReciente,
    eventosProximos,
    metaEventosProximos,
    // Actions
    fetchDashboard,
    fetchAuditoria,
    downloadAuditoriaCsv,
    fetchActividadesSistema,
    fetchActividadesRecientes,
    fetchEventosProximos
  };
});