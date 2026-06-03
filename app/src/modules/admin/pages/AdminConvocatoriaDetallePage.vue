<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, AlertCircle, CheckCheck } from 'lucide-vue-next'

import ConvocatoriaDetailTabs from '../components/ConvocatoriaDetailTabs.vue'
import ConvocatoriaTabGeneral from '../components/ConvocatoriaTabGeneral.vue'
import ConvocatoriaTabConfiguracion from '../components/ConvocatoriaTabConfiguracion.vue'
import ConvocatoriaTabCategorias from '@/modules/categorias/components/ConvocatoriaTabCategorias.vue'
import ConvocatoriaTabMaterial from '@/modules/material/components/ConvocatoriaTabMaterial.vue'

import { useConvocatoriasStore } from '@/modules/convocatorias/stores/convocatorias.store'
import Button from '@/shared/components/ui/atoms/Button.vue'

const route = useRoute()
const router = useRouter()
const convocatoriasStore = useConvocatoriasStore()

const activeTab = ref<'general' | 'categorias' | 'material' | 'configuracion'>('general')

// Lectura correcta del ID definido en vue-router
const convocatoriaId = Number(route.params.convocatoriaId)

onMounted(async () => {
  if (convocatoriaId) {
    await convocatoriasStore.fetchConvocatoriaById(convocatoriaId)
  }
})

const convocatoria = computed(() => convocatoriasStore.currentConvocatoria)

async function executePublish() {
  if (convocatoria.value) {
    await convocatoriasStore.publishConvocatoria(convocatoria.value.id_convocatoria)
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'BORRADOR': return 'border-warning bg-warning/10 text-warning'
    case 'PUBLICADA': return 'border-success bg-success/10 text-success'
    case 'CANCELADA': return 'border-error bg-error/10 text-error'
    default: return 'border-gray-300 bg-gray-50 text-text-muted'
  }
}
</script>

<template>
  <div v-if="convocatoriasStore.loading && !convocatoria" class="py-20 text-center">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
    <p class="text-text-muted text-sm font-medium">Sincronizando información de la convocatoria...</p>
  </div>

  <div v-else-if="!convocatoria" class="py-20 text-center">
    <h1 class="font-heading text-2xl font-bold text-text-main">Convocatoria no encontrada</h1>
    <Button class="mt-5" @click="router.push('/admin/convocatorias')">
      <ArrowLeft class="h-4 w-4 mr-1" />Volver a la Lista
    </Button>
  </div>

  <div v-else class="space-y-6 p-4">
    <header class="sticky top-0 z-20 rounded-xl border border-gray-200 border-t-4 border-t-accent bg-white p-4 shadow-soft">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="router.push('/admin/convocatorias')" class="flex items-center gap-1">
            <ArrowLeft class="h-4 w-4" />Atrás
          </Button>
          <div>
            <h1 class="font-heading text-xl font-bold text-text-main">{{ convocatoria.nombre_convocatoria }}</h1>
            <div class="mt-1 flex items-center gap-2 text-sm text-text-muted">
              <span>Gestión {{ convocatoria.gestion }}</span>
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border', statusClass(convocatoria.estado)]">
                {{ convocatoria.estado }}
              </span>
            </div>
          </div>
        </div>
        
        <Button 
          v-if="convocatoria.estado === 'BORRADOR'" 
          variant="accent" 
          class="flex items-center gap-2 bg-accent text-white font-bold tracking-wider px-4 py-2 rounded-lg text-xs shadow-sm"
          @click="executePublish"
        >
          <CheckCheck class="h-4 w-4" />
          PUBLICAR CONVOCATORIA
        </Button>
      </div>
    </header>
    
    <div v-if="convocatoria.estado === 'BORRADOR'" class="rounded-xl border border-warning/20 bg-warning/10 p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p class="text-sm font-medium text-warning">
          El evento está guardado como <strong>Borrador</strong>. Asegúrese de estructurar las categorías y subir el material didáctico requerido en sus respectivas pestañas antes de cambiar el estado a publicación global.
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
      <ConvocatoriaDetailTabs v-model:activeTab="activeTab" />

      <main class="min-w-0 flex-1 space-y-6">
        <ConvocatoriaTabGeneral 
          v-if="activeTab === 'general'" 
          :convocatoria="convocatoria" 
        />
        
        <ConvocatoriaTabCategorias 
          v-if="activeTab === 'categorias'" 
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