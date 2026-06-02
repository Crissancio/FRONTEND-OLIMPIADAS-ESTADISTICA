import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publicService } from '../services/public.service';
import type {
  GetColaboradoresPublicParams,
  GetMaterialesPublicParams,
  GetResultadosFinalesPublicParams,
  GetAvisosPublicosParams,
  PublicColaboradorResponseDTO,
  ColegioPublicoMinifiedDTO,
  MaterialPublicoGeneralDTO,
  ResultadoPublicoGeneralDTO,
  AvisoPublicoDTO,
  ConvocatoriaInicioDTO,
  ConvocatoriaDetalleDTO,
  ConvocatoriaListPublicDTO,
  ConvocatoriaMinified
} from '../types/public.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const usePublicStore = defineStore('public', () => {
  // ================= ESTADOS =================
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);

  // Landing / Inicio
  const inicioData = ref<ConvocatoriaInicioDTO | null>(null);
  
  // Listas generales
  const convocatoriasList = ref<ConvocatoriaListPublicDTO[]>([]);
  const convocatoriasMinified = ref<ConvocatoriaMinified[]>([]);
  const colegiosMinified = ref<ColegioPublicoMinifiedDTO[]>([]);
  
  // Detalle actual
  const currentConvocatoriaDetalle = ref<ConvocatoriaDetalleDTO | null>(null);

  // Estados paginados
  const avisos = ref<AvisoPublicoDTO[]>([]);
  const metaAvisos = ref<PaginationMeta | null>(null);

  const colaboradores = ref<PublicColaboradorResponseDTO[]>([]);
  const metaColaboradores = ref<PaginationMeta | null>(null);

  const materiales = ref<MaterialPublicoGeneralDTO[]>([]);
  const metaMateriales = ref<PaginationMeta | null>(null);

  const resultados = ref<ResultadoPublicoGeneralDTO[]>([]);
  const metaResultados = ref<PaginationMeta | null>(null);

  // ================= ACCIONES =================
  
  async function fetchInicio() {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerInicio();
      inicioData.value = response.data;
      return response.data;
    } catch (err) { error.value = err as ApiError; throw err; }
    finally { loading.value = false; }
  }

  async function fetchConvocatoriaDetalle(id: number) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerConvocatoriaDetalle(id);
      currentConvocatoriaDetalle.value = response.data;
      return response.data;
    } catch (err) { error.value = err as ApiError; throw err; }
    finally { loading.value = false; }
  }

  async function fetchConvocatorias() {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerConvocatoriasList();
      convocatoriasList.value = response.data;
      return response.data;
    } catch (err) { error.value = err as ApiError; throw err; }
    finally { loading.value = false; }
  }

  async function fetchConvocatoriasMinified() {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerConvocatoriasMinified();
      convocatoriasMinified.value = response.data;
      return response.data;
    } catch (err) { error.value = err as ApiError; throw err; }
    finally { loading.value = false; }
  }

  async function fetchColegiosMinified() {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerColegiosMinified();
      colegiosMinified.value = response.data;
      return response.data;
    } catch (err) { error.value = err as ApiError; throw err; }
    finally { loading.value = false; }
  }

  async function fetchAvisos(params?: GetAvisosPublicosParams) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerAvisos(params);
      avisos.value = response.data.items;
      metaAvisos.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  async function fetchColaboradores(params: GetColaboradoresPublicParams) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerColaboradores(params);
      colaboradores.value = response.data.items;
      metaColaboradores.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  async function fetchMateriales(params?: GetMaterialesPublicParams) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerMateriales(params);
      materiales.value = response.data.items;
      metaMateriales.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  async function fetchResultados(params?: GetResultadosFinalesPublicParams) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerResultadosFinales(params);
      resultados.value = response.data.items;
      metaResultados.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  // Las funciones específicas (por Id) que no requieran guardarse globalmente en el store
  // se pueden llamar directamente desde el componente usando el servicio publicService.

  return {
    loading,
    error,
    inicioData,
    convocatoriasList,
    convocatoriasMinified,
    colegiosMinified,
    currentConvocatoriaDetalle,
    avisos, metaAvisos,
    colaboradores, metaColaboradores,
    materiales, metaMateriales,
    resultados, metaResultados,

    fetchInicio,
    fetchConvocatoriaDetalle,
    fetchConvocatorias,
    fetchConvocatoriasMinified,
    fetchColegiosMinified,
    fetchAvisos,
    fetchColaboradores,
    fetchMateriales,
    fetchResultados
  };
});