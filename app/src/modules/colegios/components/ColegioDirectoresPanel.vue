<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, UserPlus, Link2 } from 'lucide-vue-next'
import { useColegiosStore } from '../stores/colegio.store'
import { useDirectoresStore } from '../../directores/stores/directores.store'
import Button from '@/shared/components/ui/atoms/Button.vue'
import DirectorCardAdmin from '../../directores/components/DirectorCardAdmin.vue'

const props = defineProps<{
  isOpen: boolean
  colegioId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const colegiosStore = useColegiosStore()
const directoresStore = useDirectoresStore()

const directorSeleccionadoId = ref<number | ''>('')
const isProcesando = ref(false)

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.colegioId) {
    await Promise.all([
      colegiosStore.fetchColegioById(props.colegioId),
      directoresStore.fetchDirectoresMinificados()
    ])
    directorSeleccionadoId.value = ''
  }
})

const directoresDisponibles = computed(() => {
  const asignadosIds = colegiosStore.colegioActual?.directores.map(d => d.id_director) || []
  return directoresStore.directoresMinificados.filter(d => !asignadosIds.includes(d.id_director))
})

const vincularDirector = async () => {
  if (!directorSeleccionadoId.value || !props.colegioId) return
  
  isProcesando.value = true
  try {
    await directoresStore.updateDirector(Number(directorSeleccionadoId.value), {
      id_colegio: props.colegioId
    })
    await colegiosStore.fetchColegioById(props.colegioId)
    directorSeleccionadoId.value = ''
    emit('updated')
  } catch (error) {
    console.error(error)
  } finally {
    isProcesando.value = false
  }
}

const desvincularDirector = async (idDirector: number) => {
  if (!props.colegioId) return
  
  isProcesando.value = true
  try {
    await directoresStore.updateDirector(idDirector, {
      id_colegio: null
    })
    await colegiosStore.fetchColegioById(props.colegioId)
    emit('updated')
  } catch (error) {
    console.error(error)
  } finally {
    isProcesando.value = false
  }
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
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-text-main">
                        Administrar Directores
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <Button variant="ghost" size="icon" @click="emit('close')">
                          <X class="h-5 w-5 text-text-muted" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-8">
                    
                    <div v-if="colegiosStore.isLoading || directoresStore.isLoading" class="flex justify-center py-8">
                      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>

                    <template v-else>
                      <div class="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div class="flex items-center gap-2">
                          <UserPlus class="h-5 w-5 text-text-main" />
                          <h3 class="font-bold text-text-main">Vincular Nuevo Director</h3>
                        </div>
                        
                        <div class="flex flex-col gap-3">
                          <select 
                            v-model="directorSeleccionadoId" 
                            class="input-base w-full py-2 bg-white cursor-pointer"
                            :disabled="isProcesando"
                          >
                            <option value="" disabled>Seleccione un director disponible...</option>
                            <option 
                              v-for="dir in directoresDisponibles" 
                              :key="dir.id_director" 
                              :value="dir.id_director"
                            >
                              {{ dir.nombres_completos }}
                            </option>
                          </select>
                          
                          <Button 
                            variant="primary" 
                            class="w-full flex justify-center items-center gap-2"
                            :disabled="!directorSeleccionadoId || isProcesando"
                            @click="vincularDirector"
                          >
                            <Link2 class="h-4 w-4" />
                            Vincular al Colegio
                          </Button>
                        </div>
                      </div>

                      <div class="space-y-4">
                        <h3 class="font-bold text-text-main border-b border-gray-200 pb-2">Directores Actuales</h3>
                        
                        <div v-if="(colegiosStore.colegioActual?.directores?.length ?? 0) > 0" class="space-y-3">
                        <DirectorCardAdmin 
                            v-for="director in colegiosStore.colegioActual?.directores || []" 
                            :key="director.id_director" 
                            :director="director"
                            @desvincular="desvincularDirector"
                        />
                        </div>
                        
                        <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <p class="text-text-muted text-sm">No hay directores asignados a este colegio actualmente.</p>
                        </div>
                      </div>
                    </template>

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