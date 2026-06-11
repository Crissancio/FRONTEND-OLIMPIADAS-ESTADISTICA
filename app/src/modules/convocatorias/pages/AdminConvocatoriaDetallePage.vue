<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

import ConvocatoriaDetailHeader from '../components/ConvocatoriaDetailHeader.vue'
import ConvocatoriaDetailTabs from '../components/ConvocatoriaDetailTabs.vue'
import ConvocatoriaTabGeneral from '../components/ConvocatoriaTabGeneral.vue'
import ConvocatoriaTabConfiguracion from '../components/ConvocatoriaTabConfiguracion.vue'
import ConvocatoriaTabCategorias from '@/modules/categorias/components/ConvocatoriaTabCategorias.vue'
import ConvocatoriaTabMaterial from '@/modules/material/components/ConvocatoriaTabMaterial.vue'

import Button from '@/shared/components/ui/atoms/Button.vue'
import { convocatoriasService } from '../services/convocatorias.service'
import type { ConvocatoriaDTO } from '../types/convocatorias.api'

const route = useRoute()
const router = useRouter()

const activeTab = ref<'general' | 'categorias' | 'material' | 'configuracion'>('general')
const convocatoriaId = Number(route.params.convocatoriaId)

const convocatoria = ref<ConvocatoriaDTO | null>(null)
const isLoading = ref(true)

const categoriasTabRef = ref<any>(null)

const handleOpenCreateCategoria = () => {
  activeTab.value = 'categorias'
  nextTick(() => {
    if (categoriasTabRef.value) {
      categoriasTabRef.value.openCreateCategoryModal()
    }
  })
}

onMounted(async () => {
  if (!convocatoriaId) {
    isLoading.value = false
    return
  }
  await fetchConvocatoria()
})

async function fetchConvocatoria() {
  isLoading.value = true
  try {
    const response = await convocatoriasService.obtenerConvocatoriaPorId(convocatoriaId)
    convocatoria.value = response.data
  } catch (error) {
    console.error('Error al cargar la convocatoria:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="isLoading" class="py-20 text-center">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
    <p class="text-text-muted text-sm font-medium">Cargando información de la convocatoria...</p>
  </div>

  <div v-else-if="!convocatoria" class="py-20 text-center">
    <h1 class="font-heading text-2xl font-bold text-text-main">Convocatoria no encontrada</h1>
    <Button class="mt-5" @click="router.push('/admin/convocatorias')">
      <ArrowLeft class="h-4 w-4 mr-1" />Volver a la Lista
    </Button>
  </div>

  <div v-else class="space-y-6 p-4">
    <ConvocatoriaDetailHeader 
      :convocatoria="convocatoria"
      @update:convocatoria="convocatoria = $event"
    />

    <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
      <ConvocatoriaDetailTabs 
        v-model:activeTab="activeTab" 
        @openCreateCategoria="handleOpenCreateCategoria"  
      />

      <main class="min-w-0 flex-1 space-y-6">
        <ConvocatoriaTabGeneral 
          v-if="activeTab === 'general'" 
          :convocatoria="convocatoria" 
        />
        
        <ConvocatoriaTabCategorias 
          v-if="activeTab === 'categorias'" 
          ref="categoriasTabRef"
          :convocatoriaId="convocatoria.id_convocatoria" 
        />
        
        <ConvocatoriaTabMaterial 
          v-if="activeTab === 'material'" 
          :convocatoriaId="convocatoria.id_convocatoria" 
        />
        
        <ConvocatoriaTabConfiguracion 
          v-if="activeTab === 'configuracion'" 
          :convocatoria="convocatoria" 
        />
      </main>
    </div>
  </div>
</template>