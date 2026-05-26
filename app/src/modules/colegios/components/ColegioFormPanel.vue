<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, Save, Edit2, Trash2, Power, PowerOff } from 'lucide-vue-next'
import { useColegiosStore } from '../stores/colegio.store'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { ColegioCreateDTO, ColegioUpdateDTO } from '../types/colegios.api'

const props = defineProps<{
  isOpen: boolean
  colegioId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const colegiosStore = useColegiosStore()
const isEditing = ref(false)
const isSubmitting = ref(false)

const formData = ref({
  codigo: '',
  nombre: '',
  tipo: '',
  turno: '',
  departamento: '',
  municipio: '',
  calle: '',
  estado: ''
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    isEditing.value = !props.colegioId
    if (props.colegioId) {
      const colegio = await colegiosStore.fetchColegioById(props.colegioId)
      formData.value = {
        codigo: colegio.codigo.toString(),
        nombre: colegio.nombre,
        tipo: colegio.tipo,
        turno: colegio.turno,
        departamento: colegio.departamento,
        municipio: colegio.municipio,
        calle: colegio.calle || '',
        estado: colegio.estado
      }
    } else {
      formData.value = {
        codigo: '',
        nombre: '',
        tipo: '',
        turno: '',
        departamento: '',
        municipio: '',
        calle: '',
        estado: 'PENDIENTE'
      }
    }
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // Ya no tipamos esto estrictamente como UpdateDTO para que sea compatible con ambos
    const payload = {
      codigo: Number(formData.value.codigo),
      nombre: formData.value.nombre,
      tipo: formData.value.tipo,
      turno: formData.value.turno,
      departamento: formData.value.departamento,
      municipio: formData.value.municipio,
      calle: formData.value.calle || null
    }
    if (props.colegioId) {
      await colegiosStore.updateColegio(props.colegioId, payload as ColegioUpdateDTO)
    } else {
      await colegiosStore.createColegio(payload as ColegioCreateDTO)
    }
    
    emit('saved')
    emit('close')
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

const toggleEstado = async () => {
  if (!props.colegioId) return

  try {
    if (formData.value.estado === 'INACTIVO') {
      await colegiosStore.enableColegio(props.colegioId)
      formData.value.estado = 'ACTIVO'
    } 
    else {
      await colegiosStore.disableColegio(props.colegioId)
      formData.value.estado = 'INACTIVO'
    }
    emit('saved')
    
  } catch (error) {
    console.error('Error al cambiar el estado del colegio:', error)
  }
}

const eliminarColegio = async () => {
  if (!props.colegioId) return
  const confirmacion = confirm('¡CUIDADO! Esta acción eliminará permanentemente el colegio. ¿Está seguro?')
  if (!confirmacion) return

  try {
    await colegiosStore.deleteColegio(props.colegioId) 
    emit('saved')
    emit('close')
  } catch (error) {
    console.error(error)
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
              <DialogPanel class="pointer-events-auto w-screen max-w-md lg:max-w-xl">
                <form @submit.prevent="handleSubmit" class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-primary border-b border-primary-dark">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-accent">
                        {{ colegioId ? 'Administración del Colegio' : 'Nuevo Colegio' }}
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <Button variant="ghost" size="icon" type="button" class="hover:bg-primary-dark/50" @click="emit('close')">
                          <X class="h-5 w-5 text-white/80 hover:text-white" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-6">
                    <div v-if="colegioId" class="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
                      
                      <Button v-if="!isEditing" type="button" variant="outline" size="sm" class="flex items-center gap-1.5 border-secondary/50 text-secondary-dark hover:bg-secondary/10" @click="isEditing = true">
                        <Edit2 class="h-3.5 w-3.5" /> Modificar Datos
                      </Button>
                      
                      <Button type="button" :variant="formData.estado === 'INACTIVO' ? 'primary' : 'outline'" size="sm" 
                              :class="[
                                'flex items-center gap-1.5 transition-colors',
                                formData.estado === 'INACTIVO' ? 'bg-estado-activa hover:bg-estado-activa/90 text-white border-transparent' : 'border-estado-inactivo/50 text-estado-inactivo hover:bg-estado-inactivo-soft'
                              ]"
                              @click="toggleEstado">
                        <component :is="formData.estado === 'INACTIVO' ? Power : PowerOff" class="h-3.5 w-3.5" />
                        {{ formData.estado === 'INACTIVO' ? 'Activar Colegio' : 'Desactivar Colegio' }}
                      </Button>
                      
                      <Button type="button" variant="outline" size="sm" class="flex items-center gap-1.5 text-estado-rechazado border-estado-rechazado/30 hover:bg-estado-rechazado-soft" @click="eliminarColegio">
                        <Trash2 class="h-3.5 w-3.5" /> Eliminar Permanente
                      </Button>
                    </div>

                    <div class="grid grid-cols-1 gap-6">
                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-text-main">Nombre del Colegio</label>
                        <input v-model="formData.nombre" type="text" required :disabled="!isEditing" class="input-base disabled:bg-gray-50 disabled:text-text-muted" />
                      </div>

                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-text-main">Código SIE</label>
                        <input v-model="formData.codigo" type="number" required :disabled="!isEditing" class="input-base disabled:bg-gray-50 disabled:text-text-muted" />
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Tipo</label>
                          <select v-model="formData.tipo" required :disabled="!isEditing" class="input-base cursor-pointer disabled:bg-gray-50 disabled:text-text-muted disabled:cursor-not-allowed">
                            <option value="PUBLICO">PUBLICO</option>
                            <option value="PRIVADO">PRIVADO</option>
                            <option value="CONVENIO">CONVENIO</option>
                          </select>
                        </div>

                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Turno</label>
                          <select v-model="formData.turno" required :disabled="!isEditing" class="input-base cursor-pointer disabled:bg-gray-50 disabled:text-text-muted disabled:cursor-not-allowed">
                            <option value="MAÑANA">MAÑANA</option>
                            <option value="TARDE">TARDE</option>
                            <option value="NOCHE">NOCHE</option>
                            <option value="MIXTO">MIXTO</option>
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Departamento</label>
                          <input v-model="formData.departamento" type="text" required :disabled="!isEditing" class="input-base disabled:bg-gray-50 disabled:text-text-muted" />
                        </div>

                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Municipio</label>
                          <input v-model="formData.municipio" type="text" required :disabled="!isEditing" class="input-base disabled:bg-gray-50 disabled:text-text-muted" />
                        </div>
                      </div>

                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-text-main">Calle / Zona</label>
                        <input v-model="formData.calle" type="text" :disabled="!isEditing" class="input-base disabled:bg-gray-50 disabled:text-text-muted" />
                      </div>
                    </div>
                  </div>

                  <div v-if="isEditing" class="flex flex-shrink-0 justify-end gap-3 px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <Button variant="outline" type="button" @click="colegioId ? isEditing = false : emit('close')" :disabled="isSubmitting" class="text-text-main border-gray-300 hover:bg-gray-100">
                      Cancelar
                    </Button>
                    <Button variant="primary" type="submit" class="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white border-transparent" :disabled="isSubmitting">
                      <Save class="h-4 w-4" />
                      {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
                    </Button>
                  </div>

                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>