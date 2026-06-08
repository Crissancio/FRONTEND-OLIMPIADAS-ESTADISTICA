<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useAvisosStore } from '@/modules/avisos/stores/avisos.store'
import { avisosService } from '../services/avisos.service'
import AvisoFilters from '@/modules/avisos/components/AvisoFilters.vue'
import AvisoCard from '@/modules/avisos/components/AvisoCard.vue'
import AvisoDrawer from '@/modules/avisos/components/AvisoDrawer.vue'
import { Plus, Loader2, Search } from 'lucide-vue-next'

const avisosStore = useAvisosStore()
const scrollTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const isLoading = ref(false)
let currentPage = 1
const limitPerPage = 12

const drawerConfig = reactive({
  isOpen: false,
  data: null as any
})

const loadInitialData = async () => {
  currentPage = 1
  isLoading.value = true
  try {
    const response = await avisosService.listarAvisosAdmin({
      ...avisosStore.filters,
      page: currentPage,
      limit: limitPerPage
    })
    avisosStore.setAvisos(response.data.items)
    avisosStore.setMeta(response.data.meta)
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const setupInfiniteScroll = () => {
  observer = new IntersectionObserver(async ([entry]) => {
    if (entry.isIntersecting && !isLoading.value) {
      if (currentPage < avisosStore.meta.total_pages) {
        currentPage++
        isLoading.value = true
        try {
          const response = await avisosService.listarAvisosAdmin({
            ...avisosStore.filters,
            page: currentPage,
            limit: limitPerPage
          })
          avisosStore.appendAvisos(response.data.items)
          avisosStore.setMeta(response.data.meta)
        } catch (err) {
          console.error(err)
        } finally {
          isLoading.value = false
        }
      }
    }
  }, { rootMargin: '200px' })

  if (scrollTrigger.value) observer.observe(scrollTrigger.value)
}

onMounted(() => {
  loadInitialData()
  setupInfiniteScroll()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  avisosStore.clearStore()
})

const handleFilters = async (filters: any) => {
  avisosStore.setFilters(filters)
  await loadInitialData()
}

const openCreateDrawer = () => {
  drawerConfig.data = null
  drawerConfig.isOpen = true
}

const handleCardClick = (aviso: any) => {
  drawerConfig.data = aviso
  drawerConfig.isOpen = true
}

const handleSaveAviso = async ({ isNew, data }: { isNew: boolean, data: any }) => {
  isLoading.value = true
  try {
    if (!isNew) {
      await avisosService.actualizarAviso(drawerConfig.data.id_aviso, data)
    } else {
      await avisosService.crearAviso(data)
    }
    drawerConfig.isOpen = false
    await loadInitialData()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleChangeState = async (nuevoEstado: 'PUBLICADO' | 'OCULTO') => {
  isLoading.value = true
  try {
    await avisosService.cambiarEstadoAviso(drawerConfig.data.id_aviso, { estado: nuevoEstado })
    drawerConfig.isOpen = false
    await loadInitialData()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  isLoading.value = true
  try {
    await avisosService.eliminarAviso(id)
    drawerConfig.isOpen = false
    await loadInitialData()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 max-w-400 mx-auto space-y-6 bg-(--color-background) min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight" style="font-family: var(--font-heading)">Panel de Avisos</h1>
        <p class="text-sm text-gray-500 mt-1">Gestión, control de vigencia y priorización informativa</p>
      </div>
      <button 
        @click="openCreateDrawer" 
        class="w-full md:w-auto flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-md text-sm font-bold shadow-sm hover:shadow transition-all"
        style="background-color: var(--color-accent);"
      >
        <Plus class="w-5 h-5" /> Redactar Aviso
      </button>
    </div>

    <AvisoFilters @filter="handleFilters" />

    <div class="flex flex-wrap items-center justify-start gap-6 px-2">
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full" style="background-color: var(--color-aviso-prioridad-alta)"></div>
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Prioridad Alta</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full" style="background-color: var(--color-aviso-prioridad-media)"></div>
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Prioridad Media</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full" style="background-color: var(--color-aviso-prioridad-baja)"></div>
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Prioridad Baja</span>
      </div>
    </div>

    <div v-if="avisosStore.avisos.length === 0 && !isLoading" class="bg-white rounded-md border border-dashed border-gray-300 flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Search class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900">No se encontraron avisos</h3>
      <p class="text-sm text-gray-500 mt-1 max-w-sm">No hay registros que coincidan con los filtros aplicados actualmente.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      <AvisoCard 
        v-for="aviso in avisosStore.avisos" 
        :key="aviso.id_aviso" 
        :aviso="{ ...aviso, fecha_publicacion: aviso.fecha_publicacion ?? null }"
        @click="handleCardClick"
      />
    </div>

    <div ref="scrollTrigger" class="w-full h-20 flex items-center justify-center">
      <div v-if="isLoading" class="flex items-center gap-3 px-4 py-2 bg-white rounded-md shadow-sm border border-gray-100 text-sm text-gray-600 font-bold">
        <Loader2 class="w-4 h-4 animate-spin" style="color: var(--color-primary)" />
        Cargando registros...
      </div>
    </div>

    <AvisoDrawer 
      :is-open="drawerConfig.isOpen" 
      :aviso="drawerConfig.data"
      :loading="isLoading"
      @close="drawerConfig.isOpen = false"
      @save="handleSaveAviso"
      @change-state="handleChangeState"
      @delete="handleDelete"
    />
  </div>
</template>