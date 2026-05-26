<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, Save } from 'lucide-vue-next'
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

const formData = ref({
  codigo: '',
  nombre: '',
  tipo: '',
  turno: '',
  departamento: '',
  municipio: '',
  calle: ''
})

const isSubmitting = ref(false)

const resetForm = () => {
  formData.value = {
    codigo: '',
    nombre: '',
    tipo: '',
    turno: '',
    departamento: '',
    municipio: '',
    calle: ''
  }
}

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    if (props.colegioId) {
      const colegio = await colegiosStore.fetchColegioById(props.colegioId)
      formData.value = {
        codigo: colegio.codigo.toString(),
        nombre: colegio.nombre,
        tipo: colegio.tipo,
        turno: colegio.turno,
        departamento: colegio.departamento,
        municipio: colegio.municipio,
        calle: colegio.calle || ''
      }
    } else {
      resetForm()
    }
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (props.colegioId) {
      const payload: ColegioUpdateDTO = {
        codigo: Number(formData.value.codigo),
        nombre: formData.value.nombre,
        tipo: formData.value.tipo,
        turno: formData.value.turno,
        departamento: formData.value.departamento,
        municipio: formData.value.municipio,
        calle: formData.value.calle || null
      }
      await colegiosStore.updateColegio(props.colegioId, payload)
    } else {
      const payload: ColegioCreateDTO = {
        codigo: Number(formData.value.codigo),
        nombre: formData.value.nombre,
        tipo: formData.value.tipo,
        turno: formData.value.turno,
        departamento: formData.value.departamento,
        municipio: formData.value.municipio,
        calle: formData.value.calle || null
      }
      await colegiosStore.createColegio(payload)
    }
    emit('saved')
    emit('close')
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
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
              <DialogPanel class="pointer-events-auto w-screen max-w-md lg:max-w-xl">
                <form @submit.prevent="handleSubmit" class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-text-main">
                        {{ colegioId ? 'Editar Colegio' : 'Nuevo Colegio' }}
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <Button variant="ghost" size="icon" type="button" @click="emit('close')">
                          <X class="h-5 w-5 text-text-muted" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-6">
                    <div class="grid grid-cols-1 gap-6">
                      
                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-text-main">Nombre del Colegio</label>
                        <input v-model="formData.nombre" type="text" required class="input-base w-full py-2 bg-white" />
                      </div>

                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-text-main">Código SIE</label>
                        <input v-model="formData.codigo" type="number" required class="input-base w-full py-2 bg-white" />
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Tipo</label>
                          <select v-model="formData.tipo" required class="input-base w-full py-2 bg-white cursor-pointer">
                            <option value="" disabled>Seleccione...</option>
                            <option value="PUBLICO">Público</option>
                            <option value="PRIVADO">Privado</option>
                            <option value="CONVENIO">Convenio</option>
                          </select>
                        </div>

                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Turno</label>
                          <select v-model="formData.turno" required class="input-base w-full py-2 bg-white cursor-pointer">
                            <option value="" disabled>Seleccione...</option>
                            <option value="MAÑANA">Mañana</option>
                            <option value="TARDE">Tarde</option>
                            <option value="NOCHE">Noche</option>
                            <option value="MIXTO">Mixto</option>
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Departamento</label>
                          <input v-model="formData.departamento" type="text" required class="input-base w-full py-2 bg-white" />
                        </div>

                        <div class="space-y-1">
                          <label class="block text-sm font-medium text-text-main">Municipio</label>
                          <input v-model="formData.municipio" type="text" required class="input-base w-full py-2 bg-white" />
                        </div>
                      </div>

                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-text-main">Calle / Zona (Opcional)</label>
                        <input v-model="formData.calle" type="text" class="input-base w-full py-2 bg-white" />
                      </div>

                    </div>
                  </div>

                  <div class="flex flex-shrink-0 justify-end gap-3 px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <Button variant="outline" type="button" @click="emit('close')" :disabled="isSubmitting">
                      Cancelar
                    </Button>
                    <Button variant="primary" type="submit" class="flex items-center gap-2" :disabled="isSubmitting">
                      <Save class="h-4 w-4" />
                      {{ isSubmitting ? 'Guardando...' : 'Guardar Colegio' }}
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