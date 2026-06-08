<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, Search, Check, Loader2 } from 'lucide-vue-next'
import { colegiosService } from '../services/colegios.service'
import { personasService } from '@/modules/personas/services/personas.service'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import DirectorCardAdmin from '../../directores/components/DirectorCardAdmin.vue'
import type { ColegioDetailDTO } from '../types/colegios.api'
import type { DirectorMinifiedDTO } from '@/modules/personas/types/personas.api'

const props = defineProps<{
  isOpen: boolean
  colegioId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const searchQuery = ref('')
const showDropdown = ref(false)
const isProcesando = ref(false)
const isLoading = ref(false)
const showNuevoForm = ref(false)

const colegioActual = ref<ColegioDetailDTO | null>(null)
const directoresDisponibles = ref<DirectorMinifiedDTO[]>([])

const nuevoDirectorData = ref({ nombres: '', paterno: '', materno: '', telefono_1: '', telefono_2: '' })

const handleBlur = () => {
  window.setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const fetchColegio = async () => {
  if (!props.colegioId) return
  const res = await colegiosService.obtenerColegioPorId(props.colegioId)
  if (res.data) colegioActual.value = res.data
}

const fetchDirectoresList = async () => {
  const res = await personasService.listarDirectoresCorta()
  if (res.data) directoresDisponibles.value = res.data
}

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.colegioId) {
    isLoading.value = true
    colegioActual.value = null
    searchQuery.value = ''
    showNuevoForm.value = false
    
    try {
      await Promise.all([
        fetchColegio(),
        fetchDirectoresList()
      ])
    } catch (error) {
      console.error('Error cargando datos del panel:', error)
    } finally {
      isLoading.value = false
    }
  }
})

const sugerenciasAutocompletado = computed(() => {
  if (!searchQuery.value.trim()) return []
  const asignadosIds = colegioActual.value?.directores?.map(d => d.id_director) || []
  return directoresDisponibles.value.filter(d => 
    !asignadosIds.includes(d.id_director) && 
    d.nombres_completos.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const vincularDirectorExistente = async (idDirector: number) => {
  isProcesando.value = true
  try {
    await personasService.actualizarDirector(idDirector, { id_colegio: props.colegioId })
    await fetchColegio()
    searchQuery.value = ''
    showDropdown.value = false
    emit('updated')
  } catch (error) {
    console.error('Error al vincular director:', error)
  } finally {
    isProcesando.value = false
  }
}

const crearYNuevoDirector = async () => {
  isProcesando.value = true
  try {
    await personasService.crearDirector({
      nombres: nuevoDirectorData.value.nombres,
      paterno: nuevoDirectorData.value.paterno,
      materno: nuevoDirectorData.value.materno || null,
      telefono_1: nuevoDirectorData.value.telefono_1 || null,
      telefono_2: nuevoDirectorData.value.telefono_2 || null,
      id_colegio: props.colegioId
    })
    await fetchColegio()
    showNuevoForm.value = false
    nuevoDirectorData.value = { nombres: '', paterno: '', materno: '', telefono_1: '', telefono_2: '' }
    emit('updated')
  } catch (error) {
    console.error('Error al crear director:', error)
  } finally {
    isProcesando.value = false
  }
}

const handleGuardarEdicion = async (idDirector: number, data: any) => {
  isProcesando.value = true
  try {
    await personasService.actualizarDirector(idDirector, data)
    await fetchColegio()
    emit('updated')
  } catch (error) { 
    console.error('Error al actualizar director:', error) 
  } finally { 
    isProcesando.value = false 
  }
}

const handleDesvincular = async (idDirector: number) => {
  isProcesando.value = true
  try {
    await personasService.actualizarDirector(idDirector, { id_colegio: null })
    await fetchColegio()
    emit('updated')
  } catch (error) { 
    console.error('Error al desvincular:', error) 
  } finally { 
    isProcesando.value = false 
  }
}

const handleToggleEstado = async (director: any) => {
  isProcesando.value = true
  try {
    if (director.estado !== 'INACTIVO') {
      await personasService.bajaLogicaDirector(director.id_director)
    } else {
      await personasService.altaLogicaDirector(director.id_director)
    }
    await fetchColegio()
    emit('updated')
  } catch (error) { 
    console.error('Error al cambiar estado:', error) 
  } finally { 
    isProcesando.value = false 
  }
}

const handleEliminar = async (idDirector: number) => {
  if (!confirm('¿Eliminar permanentemente este director?')) return
  isProcesando.value = true
  try {
    await personasService.eliminarDirector(idDirector)
    await fetchColegio()
    emit('updated')
  } catch (error) { 
    console.error('Error al eliminar director:', error) 
  } finally { 
    isProcesando.value = false 
  }
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-300 sm:duration-500" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-300 sm:duration-500" leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto w-screen max-w-md lg:max-w-lg">
                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-primary border-b border-blue-800">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-yellow-400">
                        Administrar Directores
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <Button variant="ghost" size="icon" class="hover:bg-blue-600" @click="emit('close')">
                          <X class="h-6 w-6 text-yellow-400" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-6 pb-40">
                    
                    <div v-if="isLoading" class="flex justify-center items-center py-20">
                      <Loader2 class="h-8 w-8 animate-spin text-primary" />
                    </div>

                    <template v-else>
                      <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                        <h3 class="font-bold text-gray-800 text-sm">Tarjetas de Directores</h3>
                        <Button variant="outline" size="sm" class="border-blue-200 text-blue-700 hover:bg-blue-50" @click="showNuevoForm = !showNuevoForm">
                          {{ showNuevoForm ? 'Cancelar' : 'Crear Nuevo Director' }}
                        </Button>
                      </div>

                      <div v-if="showNuevoForm" class="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                        <input v-model="nuevoDirectorData.nombres" type="text" placeholder="Nombres" class="input-base w-full py-1.5 bg-white text-xs" />
                        <div class="grid grid-cols-2 gap-2">
                          <input v-model="nuevoDirectorData.paterno" type="text" placeholder="Ap. Paterno" class="input-base w-full py-1.5 bg-white text-xs" />
                          <input v-model="nuevoDirectorData.materno" type="text" placeholder="Ap. Materno" class="input-base w-full py-1.5 bg-white text-xs" />
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <input v-model="nuevoDirectorData.telefono_1" type="text" placeholder="Teléfono 1" class="input-base w-full py-1.5 bg-white text-xs" />
                          <input v-model="nuevoDirectorData.telefono_2" type="text" placeholder="Teléfono 2" class="input-base w-full py-1.5 bg-white text-xs" />
                        </div>
                        <Button variant="primary" size="sm" class="w-full text-xs bg-blue-600 text-white hover:bg-blue-700" :disabled="isProcesando" @click="crearYNuevoDirector">
                          Registrar y Vincular
                        </Button>
                      </div>

                      <div v-if="(colegioActual?.directores?.length ?? 0) > 0" class="space-y-3">
                        <DirectorCardAdmin 
                          v-for="director in colegioActual?.directores || []" 
                          :key="director.id_director" 
                          :director="director"
                          @guardar="handleGuardarEdicion"
                          @toggle-estado="handleToggleEstado"
                          @desvincular="handleDesvincular"
                          @eliminar="handleEliminar"
                        />
                      </div>

                      <div v-else class="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500">
                        Sin directores asignados.
                      </div>

                      <Card class="border-gray-200 shadow-sm bg-gray-50/50 overflow-visible relative">
                        <CardContent class="p-4 space-y-3 overflow-visible">
                          <p class="text-xs font-bold text-gray-800">Agregar Director Existente</p>
                          <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Search class="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                              v-model="searchQuery" 
                              type="text" 
                              @focus="showDropdown = true" 
                              @blur="handleBlur" 
                              placeholder="Buscar por nombre..." 
                              class="input-base w-full pl-9 py-2 bg-white text-xs border-gray-300 focus:border-blue-500" 
                            />
                            
                            <div v-if="showDropdown && sugerenciasAutocompletado.length > 0" class="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-auto rounded-lg bg-white py-1 text-xs shadow-xl border border-gray-200">
                              <div v-for="sug in sugerenciasAutocompletado" :key="sug.id_director" @mousedown="vincularDirectorExistente(sug.id_director)" class="cursor-pointer select-none px-4 py-2 hover:bg-blue-50 text-gray-800 flex justify-between items-center transition-colors">
                                <span class="font-medium">{{ sug.nombres_completos }}</span>
                                <Check class="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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