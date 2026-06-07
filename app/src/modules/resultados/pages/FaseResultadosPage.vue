<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Eye, EyeOff, Upload, Loader2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import NavBarFaseResultados from '@/modules/resultados/components/NavBarFaseResultados.vue'
import ResultadosFiltros from '@/modules/resultados/components/ResultadosFiltros.vue'
import ResultadosTabla from '@/modules/resultados/components/ResultadosTabla.vue'
import ModalAgregarResultados from '@/modules/resultados/components/ModalAgregarResultados.vue'
import ModalImportarCsv from '@/modules/resultados/components/ModalImportarCsv.vue'
import ModalConfirmacion from '@/modules/resultados/components/ModalConfirmacion.vue'
import ExportarResultados from '@/modules/resultados/components/ExportarResultados.vue'
import { useResultadosStore } from '@/modules/resultados/stores/resultados.store'
import { resultadosService } from '@/modules/resultados/services/resultados.service'
import { fasesService } from '@/modules/fases/services/fases.service'
import type { ResultadoFilters, EstadoResultado } from '@/modules/resultados/types/resultados.api'
import type { FasePruebaDTO } from '@/modules/fases/types/fases.api'

const route = useRoute()
const router = useRouter()
const store = useResultadosStore()

const faseId = Number(route.params.faseId)
const categoriaId = Number(route.params.categoriaId)
const convocatoriaId = String(route.params.convocatoriaId)

const errorMessage = ref('')
const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const fase = ref<FasePruebaDTO | null>(null)
const isLoadingFase = ref(false)
const isLoadingResultados = ref(false)
const selectedIds = ref<number[]>([])

const estadoResultados = computed<EstadoResultado | null>(() => {
  if (store.resultados.length === 0) return null
  const first = store.resultados[0].estado
  const allSame = store.resultados.every((r) => r.estado === first)
  return allSame ? first : 'BORRADOR'
})

const canEdit = computed(() => {
  if (store.resultados.length === 0) return true
  return store.resultados.every((r) => r.estado === 'OCULTO' || r.estado === 'BORRADOR')
})

const canPublish = computed(() => store.resultados.length > 0 && estadoResultados.value !== 'PUBLICADO')
const canHide = computed(() => store.resultados.length > 0 && estadoResultados.value === 'PUBLICADO')

const loadFase = async () => {
  isLoadingFase.value = true
  try {
    const res = await fasesService.obtenerFasePorId(faseId)
    fase.value = res.data as FasePruebaDTO
  } catch (err) {
    extractError(err, 'No se pudo cargar la información de la fase.')
  } finally {
    isLoadingFase.value = false
  }
}

const loadResultados = async (reset = false) => {
  if (isLoadingResultados.value) return
  if (!store.hasMore && !reset) return

  isLoadingResultados.value = true
  try {
    const nextPage = reset ? 1 : store.currentPage + 1
    const res = await resultadosService.listarResultados({
      ...store.filtros,
      id_fase_prueba: faseId,
      page: nextPage,
    })
    if (reset) store.reset()
    store.setFiltros({ id_fase_prueba: faseId })
    store.appendResultados(res.data.items, {
      total: res.data.meta.total,
      page: res.data.meta.page,
      limit: res.data.meta.limit,
    })
  } catch (err) {
    extractError(err, 'No se pudieron cargar los resultados.')
  } finally {
    isLoadingResultados.value = false
  }
}

const onFiltrosChange = (nuevos: Partial<ResultadoFilters>) => {
  store.setFiltros({ ...nuevos, id_fase_prueba: faseId })
  loadResultados(true)
}

const isAgregarOpen = ref(false)
const isImportarOpen = ref(false)
const isPublicarOpen = ref(false)
const isOcultarOpen = ref(false)
const isAccionLoading = ref(false)

const publicarResultados = async () => {
  isAccionLoading.value = true
  try {
    await resultadosService.publicarResultadosFase(faseId)
    isPublicarOpen.value = false
    await loadResultados(true)
  } catch (err) {
    extractError(err, 'No se pudo publicar los resultados.')
  } finally {
    isAccionLoading.value = false
  }
}

const ocultarResultados = async () => {
  isAccionLoading.value = true
  try {
    await resultadosService.ocultarResultadosFase(faseId)
    isOcultarOpen.value = false
    await loadResultados(true)
  } catch (err) {
    extractError(err, 'No se pudo ocultar los resultados.')
  } finally {
    isAccionLoading.value = false
  }
}

const onSavedResultados = async () => {
  isAgregarOpen.value = false
  await loadResultados(true)
}

const onImported = async () => {
  isImportarOpen.value = false
  await loadResultados(true)
}

const goBack = () => {
  router.push(`/admin/convocatoria/${convocatoriaId}/categoria/${categoriaId}/gestionar?tab=fases`)
}

loadFase()
store.setFiltros({ id_fase_prueba: faseId })
loadResultados(true)

onUnmounted(() => { store.reset() })
</script>

<template>
  <div class="min-h-screen bg-background">
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 z-100 max-w-sm rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error shadow-soft"
    >
      {{ errorMessage }}
      <button class="ml-3 font-bold hover:opacity-70" @click="errorMessage = ''">✕</button>
    </div>

    <div class="space-y-4 p-4">
      <NavBarFaseResultados
        :nombre-fase="fase?.nombre_fase ?? 'Cargando...'"
        :nombre-categoria="`Categoría ${categoriaId}`"
        :estado-resultados="estadoResultados"
        :total-resultados="store.totalItems"
        :is-loading="isLoadingFase"
        @back="goBack"
      />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <Button
            v-if="canEdit"
            class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
            @click="isAgregarOpen = true"
          >
            <Plus class="h-4 w-4" />
            Agregar resultados
          </Button>

          <Button
            v-if="canEdit"
            variant="outline"
            class="flex items-center gap-2"
            @click="isImportarOpen = true"
          >
            <Upload class="h-4 w-4" />
            Importar CSV
          </Button>

          <Button
            v-if="canPublish"
            class="flex items-center gap-2 bg-success text-white hover:bg-success/90"
            @click="isPublicarOpen = true"
          >
            <Eye class="h-4 w-4" />
            Publicar resultados
          </Button>

          <Button
            v-if="canHide"
            variant="outline"
            class="flex items-center gap-2 text-text-muted"
            @click="isOcultarOpen = true"
          >
            <EyeOff class="h-4 w-4" />
            Ocultar resultados
          </Button>
        </div>

        <ExportarResultados
          :fase-id="faseId"
          :selected-ids="selectedIds"
          @error="(msg) => { errorMessage = msg }"
        />
      </div>

      <ResultadosFiltros
        :model-value="store.filtros"
        @update:model-value="onFiltrosChange"
      />

      <ResultadosTabla
        :resultados="store.resultados"
        :criterio-aprobacion="fase?.criterio_aprobacion ?? 51"
        :is-loading="isLoadingResultados"
        :has-more="store.hasMore"
        :total-items="store.totalItems"
        :selected-ids="selectedIds"
        @load-more="loadResultados(false)"
        @update:selected-ids="(ids) => { selectedIds = ids }"
      />
    </div>

    <ModalAgregarResultados
      :open="isAgregarOpen"
      :fase-id="faseId"
      :categoria-id="categoriaId"
      :id-fase-anterior="fase?.id_fase_anterior ?? null"
      :criterio-aprobacion="fase?.criterio_aprobacion ?? 51"
      :resultados-existentes="store.resultados"
      @close="isAgregarOpen = false"
      @saved="onSavedResultados"
      @error="(msg) => { errorMessage = msg }"
    />

    <ModalImportarCsv
      :open="isImportarOpen"
      :fase-id="faseId"
      @close="isImportarOpen = false"
      @imported="onImported"
      @error="(msg) => { errorMessage = msg }"
    />

    <ModalConfirmacion
      :open="isPublicarOpen"
      title="Publicar resultados"
      description="Al publicar, todos los resultados de esta fase serán visibles públicamente para los participantes. Esta acción no se puede deshacer hasta que los ocultes manualmente."
      confirm-label="Publicar"
      confirm-class="bg-success text-white hover:bg-success/90"
      :is-loading="isAccionLoading"
      @confirm="publicarResultados"
      @cancel="isPublicarOpen = false"
    />

    <ModalConfirmacion
      :open="isOcultarOpen"
      title="Ocultar resultados"
      description="Los resultados dejarán de ser visibles para los participantes. Podrás volver a publicarlos cuando lo necesites."
      confirm-label="Ocultar"
      confirm-class="bg-primary text-white hover:bg-primary-dark"
      :is-loading="isAccionLoading"
      @confirm="ocultarResultados"
      @cancel="isOcultarOpen = false"
    />
  </div>
</template>