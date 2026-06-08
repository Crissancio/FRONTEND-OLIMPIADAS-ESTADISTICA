<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Plus, Send, Loader2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CampaniasFiltros from '@/modules/campanias/components/CampaniasFiltros.vue'
import CampaniasTabla from '@/modules/campanias/components/CampaniasTabla.vue'
import DrawerCampania from '@/modules/campanias/components/DrawerCampania.vue'
import { useCampaniasStore } from '@/modules/campanias/stores/campanias.store'
import { campaniasService } from '@/modules/campanias/services/campanias.service'
import type { CampaniaDTO, CampaniaFilters, CampaniaCreateDTO, EnlaceDTO } from '@/modules/campanias/types/campanias.api'

const store = useCampaniasStore()
const errorMessage = ref('')
const selectedCampania = ref<CampaniaDTO | null>(null)
const isDrawerOpen = ref(false)
const isCrearOpen = ref(false)
const isCreating = ref(false)

const extractError = (err: any, fallback: string) => {
  const d = err?.response?.data ?? err?.data ?? err?.details ?? null
  errorMessage.value = d ? (d.error || d.message || d.detail || fallback) : (err?.message && !err.message.includes('status code') ? err.message : fallback)
}

const loadMore = async (reset = false) => {
  if (store.isLoading) return
  if (!store.hasMore && !reset) return
  store.isLoading = true
  try {
    const nextPage = reset ? 1 : store.currentPage + 1
    const res = await campaniasService.listarCampanias({ ...store.filtros, page: nextPage })
    if (reset) {
      store.reset()
      store.filtros.page = 1
    }
    store.append(res.data.items, { total: res.data.meta.total, page: res.data.meta.page })
  } catch (err) {
    extractError(err, 'No se pudieron cargar las campañas.')
  } finally {
    store.isLoading = false
  }
}

const onFiltrosChange = (nuevos: Partial<CampaniaFilters>) => {
  store.setFiltros(nuevos)
  loadMore(true)
}

const verCampania = (c: CampaniaDTO) => {
  selectedCampania.value = c
  isDrawerOpen.value = true
}

const onUpdated = (c: CampaniaDTO) => {
  store.upsert(c)
  selectedCampania.value = c
}

const onDeleted = (id: number) => {
  store.remove(id)
  isDrawerOpen.value = false
}

const nuevoForm = ref<CampaniaCreateDTO>({ nombre: '', asunto: '', contenido_mensaje: '', contenido_secundario: '', fecha_programada: '', enlaces: [] })
const nuevosEnlaces = ref<EnlaceDTO[]>([])

const crearCampania = async () => {
  if (!nuevoForm.value.nombre || !nuevoForm.value.asunto || !nuevoForm.value.contenido_mensaje) {
    errorMessage.value = 'Nombre, asunto y mensaje son requeridos.'
    return
  }
  isCreating.value = true
  errorMessage.value = ''
  try {
    const res = await campaniasService.crearCampania({
      nombre: nuevoForm.value.nombre.trim(),
      asunto: nuevoForm.value.asunto.trim(),
      contenido_mensaje: nuevoForm.value.contenido_mensaje.trim(),
      contenido_secundario: nuevoForm.value.contenido_secundario?.trim() || null,
      fecha_programada: nuevoForm.value.fecha_programada || null,
      enlaces: nuevosEnlaces.value.filter((e) => e.url && e.texto).length > 0 ? nuevosEnlaces.value.filter((e) => e.url && e.texto) : null,
    })
    store.upsert(res.data)
    isCrearOpen.value = false
    nuevoForm.value = { nombre: '', asunto: '', contenido_mensaje: '', contenido_secundario: '', fecha_programada: '' }
    nuevosEnlaces.value = []
  } catch (err) {
    extractError(err, 'No se pudo crear la campaña.')
  } finally {
    isCreating.value = false
  }
}

const inputClass = 'h-10 w-full rounded-lg border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
const textareaClass = 'min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'

loadMore(true)
onUnmounted(() => store.reset())
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

    <div class="space-y-5 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="font-heading text-2xl font-bold text-text-main">Campañas de Email</h1>
          <p class="mt-1 text-sm text-text-muted">Gestiona y monitorea el envío masivo de correos.</p>
        </div>
        <Button
          class="flex items-center gap-2 bg-accent text-primary-dark hover:bg-accent-dark font-bold"
          @click="isCrearOpen = true"
        >
          <Plus class="h-4 w-4" />Nueva campaña
        </Button>
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm text-text-muted">
          <span class="font-bold text-text-main">{{ store.totalItems }}</span> campañas en total
        </p>
      </div>

      <CampaniasFiltros :model-value="store.filtros" @update:model-value="onFiltrosChange" />

      <CampaniasTabla
        :items="store.items"
        :is-loading="store.isLoading"
        :has-more="store.hasMore"
        :total-items="store.totalItems"
        @load-more="loadMore(false)"
        @ver="verCampania"
      />
    </div>

    <DrawerCampania
      :open="isDrawerOpen"
      :campania="selectedCampania"
      @close="isDrawerOpen = false"
      @updated="onUpdated"
      @deleted="onDeleted"
      @error="(msg) => { errorMessage = msg }"
    />

    <div v-if="isCrearOpen" class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4">
      <div class="my-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-soft">
        <div class="flex items-center justify-between border-b border-gray-200 bg-primary px-5 py-4 rounded-t-2xl">
          <h2 class="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Send class="h-5 w-5" />Nueva Campaña
          </h2>
          <button class="text-white/70 hover:text-white" @click="isCrearOpen = false">
            <Plus class="h-5 w-5 rotate-45" />
          </button>
        </div>
        <div class="space-y-4 p-5">
          <div>
            <label class="mb-1 block text-xs font-bold text-text-muted">Nombre *</label>
            <input v-model="nuevoForm.nombre" :class="inputClass" placeholder="Ej: Resultados Fase 1" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-text-muted">Asunto *</label>
            <input v-model="nuevoForm.asunto" :class="inputClass" placeholder="Asunto del correo" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-text-muted">Mensaje principal *</label>
            <textarea v-model="nuevoForm.contenido_mensaje" :class="textareaClass" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-text-muted">Mensaje secundario</label>
            <textarea v-model="nuevoForm.contenido_secundario" :class="textareaClass" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-text-muted">Fecha programada</label>
            <input v-model="nuevoForm.fecha_programada" type="datetime-local" :class="inputClass" />
          </div>
          <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" :disabled="isCreating" @click="isCrearOpen = false">Cancelar</Button>
            <Button
              class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
              :disabled="isCreating"
              @click="crearCampania"
            >
              <Loader2 v-if="isCreating" class="h-4 w-4 animate-spin" />
              Crear campaña
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>