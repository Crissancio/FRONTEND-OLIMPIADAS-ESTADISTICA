import { defineStore } from 'pinia';
import { computed } from 'vue';
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
  const convocatoriaPrincipal = ref<number | null>(null);
  
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
  const inicio = inicioData;
  const convocatoriaInicio = computed(() => inicioData.value);

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

  async function fetchConvocatoriaPrincipal() {
    if (convocatoriaPrincipal.value) return convocatoriaPrincipal.value;
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerConvocatoriaPrincipalId();
      convocatoriaPrincipal.value = response.data.id_convocatoria;
      return convocatoriaPrincipal.value;
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

  async function fetchAvisos(params?: GetAvisosPublicosParams, append = false) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerAvisos(params);
      avisos.value = append ? [...avisos.value, ...response.data.items] : response.data.items;
      metaAvisos.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  async function fetchColaboradores(params: GetColaboradoresPublicParams, append = false) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerColaboradores(params);
      colaboradores.value = append ? [...colaboradores.value, ...response.data.items] : response.data.items;
      metaColaboradores.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  async function loadPersonal(tipo: GetColaboradoresPublicParams['tipo']) {
    await fetchColaboradores({ tipo, page: 1, limit: 100 });
    return colaboradores.value;
  }

  async function fetchMateriales(params?: GetMaterialesPublicParams, append = false) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerMateriales(params);
      materiales.value = append ? [...materiales.value, ...response.data.items] : response.data.items;
      metaMateriales.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  async function fetchResultados(params?: GetResultadosFinalesPublicParams, append = false) {
    loading.value = true; error.value = null;
    try {
      const response = await publicService.obtenerResultadosFinales(params);
      resultados.value = append ? [...resultados.value, ...response.data.items] : response.data.items;
      metaResultados.value = response.data.meta;
    } catch (err) { error.value = err as ApiError; }
    finally { loading.value = false; }
  }

  // Las funciones específicas (por Id) que no requieran guardarse globalmente en el store
  // se pueden llamar directamente desde el componente usando el servicio publicService.

  return {
    loading,
    error,
    inicio,
    inicioData,
    convocatoriaPrincipal,
    convocatoriaInicio,
    convocatoriasList,
    convocatoriasMinified,
    colegiosMinified,
    currentConvocatoriaDetalle,
    avisos, metaAvisos,
    colaboradores, metaColaboradores,
    materiales, metaMateriales,
    resultados, metaResultados,

    fetchInicio,
    loadInicio: fetchInicio,
    fetchConvocatoriaPrincipal,
    fetchConvocatoriaDetalle,
    loadDetalle: fetchConvocatoriaDetalle,
    fetchConvocatorias,
    fetchConvocatoriasMinified,
    fetchColegiosMinified,
    fetchAvisos,
    fetchColaboradores,
    loadPersonal,
    fetchMateriales,
    fetchResultados
  };
});
