<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, CheckCheck, AlertCircle, XCircle } from 'lucide-vue-next'

import Button from '@/shared/components/ui/atoms/Button.vue'
import { convocatoriasService } from '../services/convocatorias.service'
import type { ConvocatoriaDTO } from '../types/convocatorias.api'
import { useConvocatoriasStore } from '../stores/convocatorias.store'

const props = defineProps<{
  convocatoria: ConvocatoriaDTO
}>()

// Permite actualizar el estado local de la página al publicar
const emit = defineEmits<{
  (e: 'update:convocatoria', value: ConvocatoriaDTO): void
}>()

const router = useRouter()
const convocatoriasStore = useConvocatoriasStore()

const isPublishing = ref(false)
const publishError = ref<string | null>(null)
const publishSuccess = ref(false)

async function executePublish() {
  isPublishing.value = true
  publishError.value = null
  publishSuccess.value = false

  try {
    const response = await convocatoriasService.publicarConvocatoria(props.convocatoria.id_convocatoria)
    
    emit('update:convocatoria', response.data)
    
    publishSuccess.value = true
    setTimeout(() => { publishSuccess.value = false }, 5000)

    if (convocatoriasStore.fetchConvocatorias) {
      convocatoriasStore.fetchConvocatorias({ page: 1 }, false).catch(() => {})
    }
  } catch (error: any) {
    publishError.value = error.response?.data?.message || 'Error al publicar. Asegúrese de haber configurado las categorías y el material principal.'
    setTimeout(() => { publishError.value = null }, 8000)
  } finally {
    isPublishing.value = false
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'BORRADOR': return 'bg-warning text-white border-white/20'
    case 'PUBLICADA': return 'bg-success text-white border-white/20'
    case 'CANCELADA': return 'bg-error text-white border-white/20'
    default: return 'bg-white/20 text-white border-white/10'
  }
}
</script>

<template>
  <div class="space-y-4">
    <header class="relative z-20 rounded-xl  bg-primary p-4 shadow-soft">
      <div class="flex flex-wrap items-center justify-between gap-3">
        
        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="router.push('/admin/convocatorias')" class="flex items-center gap-1 text-white hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft class="h-4 w-4" />Atrás
          </Button>
          <div>
            <h1 class="font-heading text-xl font-bold text-white">{{ convocatoria.nombre_convocatoria }}</h1>
            <div class="mt-1 flex items-center gap-2 text-sm text-gray-200">
              <span>Gestión {{ convocatoria.gestion }}</span>
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border', statusClass(convocatoria.estado)]">
                {{ convocatoria.estado }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="relative">
          <Button 
            v-if="convocatoria.estado === 'BORRADOR'" 
            variant="accent" 
            class="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold tracking-wider px-4 py-2 rounded-lg text-xs shadow-sm transition-colors"
            :disabled="isPublishing"
            @click="executePublish"
          >
            <span v-if="isPublishing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <CheckCheck v-else class="h-4 w-4" />
            {{ isPublishing ? 'PUBLICANDO...' : 'PUBLICAR CONVOCATORIA' }}
          </Button>

          <transition name="fade-up">
            <div v-if="publishError" class="absolute top-full right-0 mt-3 w-72 bg-white border-l-4 border-l-error shadow-xl rounded-lg p-3 z-50">
              <div class="flex items-start gap-2 text-error">
                <XCircle class="h-5 w-5 shrink-0 mt-0.5" />
                <div class="flex-1">
                  <p class="text-xs font-bold uppercase">Publicación Denegada</p>
                  <p class="text-xs text-text-muted mt-1 leading-relaxed">{{ publishError }}</p>
                </div>
                <button @click="publishError = null" class="text-gray-400 hover:text-gray-600"><XCircle class="h-3 w-3"/></button>
              </div>
            </div>
          </transition>

          <transition name="fade-up">
            <div v-if="publishSuccess" class="absolute top-full right-0 mt-3 w-64 bg-white border-l-4 border-l-success shadow-xl rounded-lg p-3 z-50">
              <div class="flex items-start gap-2 text-success">
                <CheckCheck class="h-5 w-5 shrink-0 mt-0.5" />
                <div class="flex-1">
                  <p class="text-xs font-bold uppercase">Publicación Exitosa</p>
                  <p class="text-xs text-text-muted mt-1 leading-relaxed">La convocatoria ahora es pública.</p>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </header>
    
    <div v-if="convocatoria.estado === 'BORRADOR'" class="rounded-xl border border-warning/30 bg-warning/10 p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p class="text-sm font-medium text-warning-dark">
          El evento está guardado como <strong>Borrador</strong>. Asegúrese de estructurar las categorías y subir el material didáctico en sus respectivas pestañas antes de publicarla.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>