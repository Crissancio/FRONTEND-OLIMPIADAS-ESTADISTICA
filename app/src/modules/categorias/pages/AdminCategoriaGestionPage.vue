<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBarGestionCategoria from '@/modules/categorias/components/NavBarGestionCategoria.vue'
import TabFasesCategoria from '@/modules/fases/components/TabFasesCategoria.vue'
import TabInscritosCategoria from '@/modules/inscripcion/components/TabInscritosCategoria.vue'
import TabConfiguracionCategoria from '@/modules/categorias/components/TabConfiguracionCategoria.vue'
import CategoriaGestionTabs from '@/modules/admin/components/CategoriaGestionTabs.vue'
import { categoriasService } from '@/modules/categorias/services/categorias.service'
import type { CategoriaDTO, EstadoEntidad } from '@/modules/categorias/types/categorias.api'

type CategoriaTab = 'fases' | 'inscritos' | 'configuracion'

interface CategoriaLocal {
  nombre: string
  curso: string
  grado: string
  estado: EstadoEntidad
}

const route = useRoute()
const router = useRouter()

const convocatoriaId = typeof route.params.convocatoriaId === 'string' ? route.params.convocatoriaId : ''
const categoriaId = typeof route.params.categoriaId === 'string' ? route.params.categoriaId : ''
const numericCategoriaId = computed(() => Number(categoriaId))

const isDesktop = ref(false)
let mediaQuery: MediaQueryList | null = null
const updateDesktop = () => { isDesktop.value = Boolean(mediaQuery?.matches) }
onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  updateDesktop()
  mediaQuery.addEventListener('change', updateDesktop)
})
onUnmounted(() => { mediaQuery?.removeEventListener('change', updateDesktop) })

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

const categoria = ref<CategoriaLocal>({ nombre: 'Categoría', curso: '', grado: 'SECUNDARIA', estado: 'BORRADOR' })
const isLoadingCategoria = ref(false)
const categoriaError = ref('')

const toCategoriaLocal = (item: CategoriaDTO): CategoriaLocal => ({
  nombre: item.nombre_categoria,
  curso: String(item.curso),
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

const activeTab = ref<CategoriaTab>('fases')

const goBack = () => {
  const tab = isDesktop.value ? 'general' : 'categorias'
  router.push(`/admin/convocatoria/${convocatoriaId}/gestionar?tab=${tab}`)
}

const onCategoriaUpdated = (data: CategoriaLocal) => {
  categoria.value = { ...data }
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
      :curso="categoria.curso"
      :grado="categoria.grado"
      :estado="categoria.estado"
      :is-loading="isLoadingCategoria"
      :error="categoriaError"
      @back="goBack"
    />

    <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
      <CategoriaGestionTabs v-model:active-tab="activeTab" />

      <main class="min-w-0 flex-1 space-y-6">
        <TabFasesCategoria
          v-if="activeTab === 'fases'"
          :categoria-id="numericCategoriaId"
          @error="onChildError"
        />

        <TabInscritosCategoria
          v-if="activeTab === 'inscritos'"
          :categoria-id="numericCategoriaId"
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