<script setup lang="ts">
import { watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, MapPin, Building2, Clock, Map, Hash, Info } from 'lucide-vue-next'
import { useColegiosStore } from '../stores/colegio.store'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import DirectorCardAdmin from '../../directores/components/DirectorCardAdmin.vue'

const props = defineProps<{
  isOpen: boolean
  colegioId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const colegiosStore = useColegiosStore()

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.colegioId) {
    await colegiosStore.fetchColegioById(props.colegioId)
  }
})

const estadoClass = (estado: string) => {
  const map: Record<string, string> = {
    'REVISADO': 'bg-estado-revisado-soft text-estado-revisado border-estado-revisado/20',
    'RECHAZADO': 'bg-estado-rechazado-soft text-estado-rechazado border-estado-rechazado/20',
    'PENDIENTE': 'bg-estado-pendiente-soft text-estado-pendiente border-estado-pendiente/20',
    'INACTIVO': 'bg-estado-inactivo-soft text-estado-inactivo border-estado-inactivo/20'
  }
  return map[estado?.toUpperCase()] || 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild 
        as="template" 
        enter="ease-in-out duration-300" 
        enter-from="opacity-0" 
        enter-to="opacity-100" 
        leave="ease-in-out duration-300" 
        leave-from="opacity-100" 
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <TransitionChild 
              as="template" 
              enter="transform transition ease-in-out duration-300 sm:duration-500" 
              enter-from="translate-x-full" 
              enter-to="translate-x-0" 
              leave="transform transition ease-in-out duration-300 sm:duration-500" 
              leave-from="translate-x-0" 
              leave-to="translate-x-full"
            >
              <DialogPanel class="pointer-events-auto w-screen max-w-md lg:max-w-4xl">
                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-text-main">
                        Detalles del Colegio
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <Button variant="ghost" size="icon" @click="emit('close')">
                          <X class="h-5 w-5 text-text-muted" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6">
                    <div v-if="colegiosStore.isLoading" class="flex h-full items-center justify-center">
                      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                    
                    <div v-else-if="colegiosStore.colegioActual" class="flex flex-col lg:flex-row gap-8 h-full">
                      
                      <div class="flex-1 border-r-0 lg:border-r border-gray-200 pr-0 lg:pr-6">
                        <div class="flex items-center justify-between mb-6">
                          <h3 class="font-bold text-lg text-text-main">Información Institucional</h3>
                          <Badge variant="outline" :class="`border px-2.5 py-1 ${estadoClass(colegiosStore.colegioActual.estado)}`">
                            {{ colegiosStore.colegioActual.estado }}
                          </Badge>
                        </div>
                        
                        <div class="space-y-6">
                          <div>
                            <h4 class="text-2xl font-bold text-text-main mb-1">{{ colegiosStore.colegioActual.nombre }}</h4>
                            <div class="flex items-center gap-2 text-text-muted">
                              <Hash class="h-4 w-4" />
                              <span>Código SIE: {{ colegiosStore.colegioActual.codigo }}</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                            <div class="space-y-1">
                              <div class="flex items-center gap-2 text-text-muted text-sm">
                                <Building2 class="h-4 w-4" />
                                <span>Tipo de Institución</span>
                              </div>
                              <p class="font-medium text-text-main">{{ colegiosStore.colegioActual.tipo }}</p>
                            </div>
                            <div class="space-y-1">
                              <div class="flex items-center gap-2 text-text-muted text-sm">
                                <Clock class="h-4 w-4" />
                                <span>Turno</span>
                              </div>
                              <p class="font-medium text-text-main">{{ colegiosStore.colegioActual.turno }}</p>
                            </div>
                          </div>

                          <div class="space-y-4">
                            <h4 class="font-bold text-text-main border-b border-gray-200 pb-2">Ubicación Geográfica</h4>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div class="space-y-1">
                                <div class="flex items-center gap-2 text-text-muted text-sm">
                                  <Map class="h-4 w-4" />
                                  <span>Departamento</span>
                                </div>
                                <p class="font-medium text-text-main">{{ colegiosStore.colegioActual.departamento }}</p>
                              </div>
                              <div class="space-y-1">
                                <div class="flex items-center gap-2 text-text-muted text-sm">
                                  <MapPin class="h-4 w-4" />
                                  <span>Municipio</span>
                                </div>
                                <p class="font-medium text-text-main">{{ colegiosStore.colegioActual.municipio }}</p>
                              </div>
                              <div class="sm:col-span-2 space-y-1">
                                <div class="flex items-center gap-2 text-text-muted text-sm">
                                  <Info class="h-4 w-4" />
                                  <span>Calle / Zona</span>
                                </div>
                                <p class="font-medium text-text-main">{{ colegiosStore.colegioActual.calle || 'No especificada' }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="w-full lg:w-96 flex-shrink-0">
                        <h3 class="font-bold text-lg text-text-main mb-6">Directores Asignados</h3>
                        
                        <div v-if="colegiosStore.colegioActual.directores?.length > 0" class="space-y-3">
                          <DirectorCardAdmin 
                            v-for="director in colegiosStore.colegioActual.directores" 
                            :key="director.id_director" 
                            :director="director"
                          />
                        </div>
                        
                        <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <p class="text-text-muted text-sm">No hay directores asignados a este colegio.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>