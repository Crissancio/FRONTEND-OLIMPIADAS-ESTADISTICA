<script setup lang="ts">
import { ref } from 'vue'
import { 
  X, Plus, ExternalLink, FileText, Video, 
  Link as LinkIcon, Settings, Globe, EyeOff, 
  FileEdit, AlertCircle, Loader2 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

import { materialesService } from '@/modules/material/services/material.service'
import type { MaterialDTO } from '@/modules/material/types/material.api'

const emit = defineEmits<{
  (e: 'add-material', faseId: number): void
  (e: 'admin-material', materialId: number): void
}>()

const isOpen = ref(false)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const materials = ref<MaterialDTO[]>([])
const currentFaseId = ref<number | null>(null)
const currentFaseNombre = ref('')

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Sin fecha'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  }).format(date)
}

const getIcon = (tipo: string) => {
  if (tipo.includes('VIDEO')) return Video
  if (tipo.includes('EXTERNO') || tipo === 'PAGINA_EXTERNA') return LinkIcon
  return FileText
}

const getWatermarkIcon = (estado: string) => {
  if (estado === 'PUBLICO') return Globe
  if (estado === 'OCULTO') return EyeOff
  return FileEdit
}

const getStateClasses = (estado: string) => {
  if (estado === 'PUBLICO') {
    return {
      watermark: 'text-[var(--color-publicacion-publica)]',
      icon: 'text-[var(--color-publicacion-publica)] bg-[var(--color-publicacion-publica-soft)]',
      badge: 'text-[var(--color-publicacion-publica)] bg-[var(--color-publicacion-publica-soft)] border-[var(--color-publicacion-publica)]'
    }
  }
  if (estado === 'OCULTO') {
    return {
      watermark: 'text-[var(--color-publicacion-oculta)]',
      icon: 'text-[var(--color-publicacion-oculta)] bg-[var(--color-publicacion-oculta-soft)]',
      badge: 'text-[var(--color-publicacion-oculta)] bg-[var(--color-publicacion-oculta-soft)] border-[var(--color-publicacion-oculta)]'
    }
  }
  return {
    watermark: 'text-[var(--color-publicacion-borrador)]',
    icon: 'text-[var(--color-publicacion-borrador)] bg-[var(--color-publicacion-borrador-soft)]',
    badge: 'text-[var(--color-publicacion-borrador)] bg-[var(--color-publicacion-borrador-soft)] border-[var(--color-publicacion-borrador)]'
  }
}

// --- Control de carga de la API ---
const cargarMateriales = async (faseId: number) => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await materialesService.obtenerPorFase(faseId)
    materials.value = response.data || []
  } catch (error: any) {
    console.error('Error al cargar materiales:', error)
    errorMessage.value = error?.message || 'No se pudieron obtener los materiales de esta fase.'
  } finally {
    isLoading.value = false
  }
}

// --- Acciones de apertura y cierre ---
const open = (faseId: number, nombreFase: string) => {
  currentFaseId.value = faseId
  currentFaseNombre.value = nombreFase
  materials.value = []
  isOpen.value = true
  cargarMateriales(faseId)
}

const close = () => {
  isOpen.value = false
  currentFaseId.value = null
  currentFaseNombre.value = ''
  errorMessage.value = null
}

const handleAgregarMaterial = () => {
  if (currentFaseId.value) {
    emit('add-material', currentFaseId.value)
  }
}

defineExpose({ open, close, refresh: () => currentFaseId.value && cargarMateriales(currentFaseId.value) })
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in"
  >
    <Card class="w-full max-w-6xl border-gray-200 bg-white shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
      
      <CardHeader class="border-b border-gray-100 pb-4 shrink-0 bg-gray-50/50">
        <CardTitle class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-base font-bold text-text-main">
          <div>
            <span class="text-lg block md:inline font-extrabold">Materiales de la Fase</span>
            <span class="text-sm font-medium text-primary md:ml-2 bg-primary/10 px-2 py-0.5 rounded-md">
              {{ currentFaseNombre }}
            </span>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <Button 
              variant="accent" 
              size="sm" 
              class="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-dark shadow-sm text-xs"
              @click="handleAgregarMaterial"
            >
              <Plus class="h-4 w-4" /> Agregar Material
            </Button>
            <button @click="close" class="rounded-md p-1.5 text-text-muted hover:bg-gray-200 transition-colors ml-1">
              <X class="h-4 w-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent class="flex-1 overflow-y-auto p-6 bg-gray-50/30">
        
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 class="h-8 w-8 text-primary animate-spin" />
          <p class="text-sm font-medium text-text-muted">Cargando materiales disponibles...</p>
        </div>

        <div v-else-if="errorMessage" class="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-4 max-w-2xl mx-auto shadow-sm">
          <AlertCircle class="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold uppercase tracking-wider text-danger mb-1">Error de carga</h4>
            <p class="text-sm font-medium whitespace-pre-wrap text-danger">{{ errorMessage }}</p>
          </div>
          <Button variant="outline" size="sm" class="border-danger text-danger hover:bg-danger-soft shrink-0" @click="currentFaseId && cargarMateriales(currentFaseId)">
            Reintentar
          </Button>
        </div>

        <div v-else-if="materials.length === 0" class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white max-w-xl mx-auto p-6">
          <div class="h-12 w-12 bg-gray-100 text-text-muted flex items-center justify-center rounded-full mb-3">
            <FileText class="h-6 w-6" />
          </div>
          <h3 class="text-sm font-bold text-text-main mb-1">No hay materiales todavía</h3>
          <p class="text-xs text-text-muted max-w-xs mb-4">
            Esta fase aún no cuenta con guías, exámenes o recursos asignados. ¡Sé el primero en agregar uno!
          </p>
          <Button variant="outline" size="sm" class="text-xs flex items-center gap-1.5" @click="handleAgregarMaterial">
            <Plus class="h-3.5 w-3.5" /> Subir primer material
          </Button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          <div 
            v-for="material in materials" 
            :key="material.id_material"
            :class="[
              'group relative flex flex-col rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] h-full overflow-hidden bg-white',
              material.estado === 'PUBLICO' ? 'bg-white' : 'bg-gray-100/70'
            ]"
          >
            <component 
              :is="getWatermarkIcon(material.estado)" 
              :class="[
                'absolute -right-4 top-1/2 -translate-y-1/2 h-28 w-28 opacity-10 pointer-events-none z-0 transition-transform duration-500 group-hover:scale-110',
                getStateClasses(material.estado).watermark
              ]"
            />
            
            <div class="p-4 flex-1 flex flex-col gap-3 relative z-10">
              <div class="flex items-start gap-3">
                <div 
                  :class="[
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110',
                    getStateClasses(material.estado).icon
                  ]"
                >
                  <component :is="getIcon(material.tipo_material)" class="h-5 w-5 transition-transform duration-300" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-sm text-text-main leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-primary" :title="material.nombre_material">
                    {{ material.nombre_material }}
                  </h4>
                  <p class="text-[11px] text-text-muted mt-1 font-medium flex items-center gap-1">
                    {{ formatDate(material.fecha_publicacion) }}
                  </p>
                </div>
              </div>
              
              <p v-if="material.descripcion" class="text-xs text-text-muted line-clamp-2 leading-relaxed px-1">
                {{ material.descripcion }}
              </p>
              
              <div class="flex items-center gap-2 mt-auto pt-2">
                <Badge variant="outline" class="text-[10px] font-semibold border-gray-200 text-text-muted bg-white/50">
                  {{ material.tipo_material.replace('_', ' ') }}
                </Badge>
                
                <Badge 
                  variant="outline" 
                  :class="[
                    'text-[10px] font-semibold px-1.5 border-opacity-30',
                    getStateClasses(material.estado).badge
                  ]"
                >
                  {{ material.estado }}
                </Badge>
              </div>
            </div>

            <div class="border-t border-gray-200 flex p-2 gap-2 bg-gray-50/80 rounded-b-xl relative z-10 transition-colors duration-300 group-hover:bg-primary/5">
              <div class="w-1/2">
                <Button 
                  variant="outline" 
                  class="w-full text-xs h-8 flex justify-center items-center gap-1.5 bg-white hover:bg-gray-100 hover:text-primary transition-colors border-gray-200"
                  @click="emit('admin-material', material.id_material)"
                >
                  <Settings class="h-3.5 w-3.5" /> Administrar
                </Button>
              </div>

              <a :href="material.enlace_acceso" target="_blank" class="w-1/2 block">
                <Button 
                  variant="accent" 
                  class="w-full text-xs h-8 flex justify-center items-center gap-1.5 bg-secondary hover:bg-secondary-dark text-white border-none shadow-sm transition-colors"
                >
                  <ExternalLink class="h-3.5 w-3.5" /> Abrir
                </Button>
              </a>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  </div>
</template>