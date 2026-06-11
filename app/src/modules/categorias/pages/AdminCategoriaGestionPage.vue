<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import NavBarGestionCategoria from '@/modules/categorias/components/NavBarGestionCategoria.vue'
import TabFasesCategoria from '@/modules/fases/components/TabFasesCategoria.vue'
import TabInscritosCategoria from '@/modules/inscripcion/components/TabInscritosCategoria.vue'
import TabConfiguracionCategoria from '@/modules/categorias/components/TabConfiguracionCategoria.vue'
import CategoriaGestionTabs from '@/modules/admin/components/CategoriaGestionTabs.vue'
import { categoriasService } from '@/modules/categorias/services/categorias.service'
import { useCategoriasStore } from '@/modules/categorias/stores/categorias.store'
import type { CategoriaDTO, EstadoEntidad, NivelEducativo } from '@/modules/categorias/types/categorias.api'

type CategoriaTab = 'fases' | 'inscritos' | 'configuracion'

interface CategoriaLocal {
  nombre: string
  curso: number
  grado: string
  estado: EstadoEntidad
}

const route = useRoute()
const router = useRouter()
const categoriasStore = useCategoriasStore()

const convocatoriaId = typeof route.params.convocatoriaId === 'string' ? route.params.convocatoriaId : ''
const categoriaId = typeof route.params.categoriaId === 'string' ? route.params.categoriaId : ''
const numericCategoriaId = computed(() => Number(categoriaId))

const isDesktop = ref(false)
let mediaQuery: MediaQueryList | null = null

const updateDesktop = () => { 
  isDesktop.value = Boolean(mediaQuery?.matches) 
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  updateDesktop()
  mediaQuery.addEventListener('change', updateDesktop)
})

onUnmounted(() => { 
  mediaQuery?.removeEventListener('change', updateDesktop)
  categoriasStore.clearCategorias()
})

const errorMessage = ref('')
const isLoadingCategoria = ref(false)
const categoriaError = ref('')

const categoria = ref<CategoriaLocal>({ 
  nombre: 'Categoría', 
  curso: 1, 
  grado: 'SECUNDARIA', 
  estado: 'BORRADOR' 
})

const activeTab = ref<CategoriaTab>('fases')

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const toCategoriaLocal = (item: CategoriaDTO): CategoriaLocal => ({
  nombre: item.nombre_categoria,
  curso: Number(item.curso),
  grado: item.nivel,
  estado: item.estado,
})

const loadCategoria = async () => {
  if (!Number.isFinite(numericCategoriaId.value)) return
  isLoadingCategoria.value = true
  categoriaError.value = ''
  try {
    const res = await categoriasService.obtenerCategoriaPorId(numericCategoriaId.value)
    categoria.value = toCategoriaLocal(res.data)
  } catch (err) {
    categoriaError.value = 'No se pudo cargar la categoría.'
    extractError(err, categoriaError.value)
  } finally {
    isLoadingCategoria.value = false
  }
}

watch(numericCategoriaId, loadCategoria, { immediate: true })

const goBack = () => {
  const tab = isDesktop.value ? 'general' : 'categorias'
  router.push(`/admin/convocatoria/${convocatoriaId}/gestionar?tab=${tab}`)
}

const onCategoriaUpdated = (data: CategoriaLocal) => {
  categoria.value = data
  if (categoriasStore.actualizarCategoriaLocal) {
    categoriasStore.actualizarCategoriaLocal(numericCategoriaId.value, {
      nombre_categoria: data.nombre,
      curso: data.curso,
      nivel: data.grado as NivelEducativo,
      estado: data.estado
    })
  }
}

const onCategoriaDeleted = () => {
  router.push(`/admin/convocatoria/${convocatoriaId}/gestionar?tab=categorias`)
}

const onChildError = (msg: string) => {
  errorMessage.value = msg
}
</script>

<template>
  <div class="space-y-6 p-4">
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 z-100 max-w-sm rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error shadow-soft"
    >
      {{ errorMessage }}
      <button class="ml-3 font-bold hover:opacity-70" @click="errorMessage = ''">✕</button>
    </div>

    <NavBarGestionCategoria
      :nombre="categoria.nombre"
      :curso="String(categoria.curso)"
      :grado="categoria.grado"
      :estado="categoria.estado"
      :is-loading="isLoadingCategoria"
      :error="categoriaError"
      @back="goBack"
    />

    <div v-if="isLoadingCategoria" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="mt-4 text-sm font-medium text-text-muted">Cargando información de la categoría...</p>
    </div>

    <div v-else class="flex flex-col gap-5 lg:flex-row lg:items-start">
      <CategoriaGestionTabs v-model:active-tab="activeTab" />

      <main class="min-w-0 flex-1 space-y-6">
        <TabFasesCategoria
          v-if="activeTab === 'fases'"
          :convocatoria-id="Number(convocatoriaId)"
          :categoria-id="numericCategoriaId"
          @error="onChildError"
        />

        <TabInscritosCategoria
          v-if="activeTab === 'inscritos'"
          :categoria-id="numericCategoriaId"
          :convocatoria-id="Number(convocatoriaId)"
          :curso-cat="categoria.curso"
          :nivel-cat="categoria.grado"
          @error="onChildError"
        />

        <TabConfiguracionCategoria
          v-if="activeTab === 'configuracion'"
          :categoria-id="numericCategoriaId"
          :categoria="categoria"
          @updated="onCategoriaUpdated"
          @deleted="onCategoriaDeleted"
          @error="onChildError"
        />
      </main>
    </div>
  </div>
</template>