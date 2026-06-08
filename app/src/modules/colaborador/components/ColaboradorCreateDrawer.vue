<script setup lang="ts">
import { ref, nextTick, onUnmounted, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, UploadCloud } from 'lucide-vue-next'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { personasService } from '@/modules/personas/services/personas.service'
import type { TipoColaborador } from '@/modules/personas/types/personas.api'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ 
  (e: 'close'): void
  (e: 'created'): void
  (e: 'error', err: any): void 
}>()

const isLoading = ref(false)

const formData = ref({
  nombres: '',
  paterno: '',
  materno: '',
  correo: '',
  rol: '',
  tipo: 'COLABORADOR' as TipoColaborador,
  presentacion: ''
})

const isFormValid = computed(() => {
  return (
    formData.value.nombres.trim() !== '' &&
    formData.value.paterno.trim() !== '' &&
    formData.value.correo.trim() !== '' &&
    formData.value.rol.trim() !== '' &&
    formData.value.tipo.trim() !== ''
  )
})

const ROLES_DISPONIBLES = [
  'DIRECTOR(A)',
  'DOCENTE TITULAR',
  'DOCENTE INTERINO',
  'INVESTIGADOR(A)',
  'AUXILIAR DE DOCENCIA',
  'ESTUDIANTE',
  'ASISTENTE ADMINISTRATIVO',
  'TÉCNICO(A) DE LABORATORIO',
  'AUXILIAR DE INVESTIGACIÓN',
  'AUXILIAR DE INTERACCION',
  'PASANTE'
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const rawImageUrl = ref<string | null>(null)
const isDragging = ref(false) 
let cropperInstance: Cropper | null = null

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) return 

  const reader = new FileReader()
  reader.onload = (e) => {
    rawImageUrl.value = e.target?.result as string
    nextTick(() => {
      if (imageRef.value) {
        if (cropperInstance) cropperInstance.destroy()
        
        cropperInstance = new Cropper(imageRef.value, {
          aspectRatio: 1,
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 1,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
        } as any)
      }
    })
  }
  reader.readAsDataURL(file)
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

const triggerFileInput = () => fileInputRef.value?.click()

const handleClose = () => {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  rawImageUrl.value = null
  isDragging.value = false
  formData.value = { 
    nombres: '', 
    paterno: '', 
    materno: '', 
    correo: '', 
    rol: '', 
    tipo: 'COLABORADOR', 
    presentacion: '' 
  }
  emit('close')
}

const submitForm = async () => {
  if (isLoading.value || !isFormValid.value) return
  isLoading.value = true

  try {
    let perfilBlob: File | null = null
    
    if (cropperInstance) {
      const canvas = (cropperInstance as any).getCroppedCanvas({ width: 400, height: 400 }) as HTMLCanvasElement
      
      perfilBlob = await new Promise<File>((resolve) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            resolve(new File([blob], 'perfil.jpg', { type: 'image/jpeg' }))
          }
        }, 'image/jpeg', 0.9)
      })
    }

    await personasService.crearColaborador({
      nombres: formData.value.nombres,
      paterno: formData.value.paterno,
      materno: formData.value.materno || null,
      rol: formData.value.rol,
      tipo: formData.value.tipo,
      correo: formData.value.correo,
      presentacion: formData.value.presentacion || null,
      perfil: perfilBlob
    })
    
    emit('created')
    handleClose()
  } catch (error) {
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (cropperInstance) cropperInstance.destroy()
})
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div class="flex h-full flex-col bg-white shadow-2xl">
                  <div class="flex items-center justify-between bg-primary px-6 py-4 text-white">
                    <DialogTitle class="font-heading text-lg font-semibold">Nuevo Colaborador</DialogTitle>
                    <button @click="handleClose" class="rounded-full p-1 hover:bg-white/10 transition-colors">
                      <X class="h-5 w-5" />
                    </button>
                  </div>

                  <div class="flex-1 overflow-y-auto p-6">
                    <form @submit.prevent="submitForm" class="space-y-5">
                      
                      <div>
                        <label class="block text-sm font-medium text-text-main mb-1">Fotografía de Perfil</label>
                        <div 
                          v-if="!rawImageUrl" 
                          @click="triggerFileInput"
                          @dragover.prevent="isDragging = true"
                          @dragleave.prevent="isDragging = false"
                          @drop.prevent="handleDrop"
                          :class="[
                            'mt-1 flex justify-center rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors',
                            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                          ]"
                        >
                          <div class="text-center pointer-events-none">
                            <UploadCloud :class="['mx-auto h-10 w-10 transition-colors', isDragging ? 'text-primary' : 'text-gray-400']" />
                            <div class="mt-4 flex text-sm leading-6 justify-center">
                              <span class="font-semibold text-primary hover:text-primary-dark">Sube un archivo</span>
                              <p class="pl-1 text-gray-600">o arrastra y suelta aquí</p>
                            </div>
                            <p class="text-xs leading-5 text-gray-500">PNG, JPG hasta 5MB</p>
                          </div>
                        </div>
                        
                        <div v-else class="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                          <img ref="imageRef" :src="rawImageUrl" class="max-w-full block" />
                          <button type="button" @click="rawImageUrl = null" class="absolute top-2 right-2 z-10 rounded-full bg-white p-1 shadow hover:bg-gray-100 text-error">
                            <X class="h-4 w-4" />
                          </button>
                        </div>
                        <input type="file" ref="fileInputRef" @change="handleFileSelect" accept="image/*" class="hidden" />
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-text-main mb-1">Nombres</label>
                          <input v-model="formData.nombres" required class="input-base" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-text-main mb-1">Paterno</label>
                          <input v-model="formData.paterno" required class="input-base" />
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-text-main mb-1">Materno</label>
                          <input v-model="formData.materno" class="input-base" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-text-main mb-1">Correo</label>
                          <input v-model="formData.correo" type="email" required class="input-base" />
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-text-main mb-1">Rol</label>
                        <input 
                          v-model="formData.rol" 
                          list="sugerencias-roles"
                          required 
                          placeholder="Ej: Docente Titular"
                          class="input-base" 
                        />
                        <datalist id="sugerencias-roles">
                          <option v-for="rol in ROLES_DISPONIBLES" :key="rol" :value="rol"></option>
                        </datalist>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-text-main mb-1">Tipo</label>
                        <select v-model="formData.tipo" class="input-base">
                          <option value="PERSONAL ACADEMICO">Personal Académico</option>
                          <option value="ADMINISTRATIVO">Administrativo</option>
                          <option value="COLABORADOR">Colaborador</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-text-main mb-1">Presentación (Breve)</label>
                        <textarea v-model="formData.presentacion" rows="3" class="input-base resize-none"></textarea>
                      </div>

                    </form>
                  </div>

                  <div class="border-t border-gray-200 bg-gray-50 p-4 flex justify-end gap-3">
                    <Button variant="ghost" @click="handleClose" :disabled="isLoading">Cancelar</Button>
                    <Button variant="primary" @click="submitForm" :disabled="isLoading || !isFormValid" class="disabled:opacity-50">
                      {{ isLoading ? 'Guardando...' : 'Guardar Colaborador' }}
                    </Button>
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