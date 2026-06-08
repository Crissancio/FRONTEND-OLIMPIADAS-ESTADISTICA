<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, UploadCloud, Link as LinkIcon, File as FileIcon, Calendar as CalendarIcon, FileText, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-vue-next'
import { DatePicker as VDatePicker } from 'v-calendar'
import VuePdfEmbed from 'vue-pdf-embed'
import 'v-calendar/style.css'

import { materialesService } from '@/modules/material/services/material.service'
import type { TipoMaterialEnum, MaterialArchivoCreateDTO, MaterialExternoCreateDTO } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const modalTab = ref<'archivo' | 'externo'>('archivo')
const isSubmitting = ref(false)
const errorMessage = ref('')

const getMinDatePlus10Mins = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 10)
  return date
}

const minDate = ref(getMinDatePlus10Mins())

const timeRules = ref({
  hours: (hour: number, { date }: any) => {
    if (!date) return true
    if (date.toDateString() === minDate.value.toDateString()) {
      return hour >= minDate.value.getHours()
    }
    return true
  },
  minutes: (minute: number, { date, hours }: any) => {
    if (!date) return true
    if (date.toDateString() === minDate.value.toDateString() && hours === minDate.value.getHours()) {
      return minute >= minDate.value.getMinutes()
    }
    return true
  }
})

const form = ref({
  nombre_material: '',
  descripcion: '',
  tipo_material_archivo: 'DOCUMENTO' as TipoMaterialEnum,
  tipo_material_externo: 'PAGINA_EXTERNA' as TipoMaterialEnum,
  enlace_acceso: '',
  fecha_publicacion: getMinDatePlus10Mins()
})

const fileInput = ref<HTMLInputElement | null>(null)
const attachedFile = ref<File | null>(null)
const isDragging = ref(false)

const isFormValid = computed(() => {
  if (!form.value.nombre_material.trim()) return false
  if (!form.value.fecha_publicacion) return false 
  
  if (modalTab.value === 'archivo') {
    if (!attachedFile.value) return false 
  } else {
    if (!form.value.enlace_acceso.trim()) return false 
  }
  
  return true
})

const previewUrl = computed(() => {
  if (modalTab.value === 'archivo' && attachedFile.value) {
    return URL.createObjectURL(attachedFile.value)
  }
  return null
})

const fileType = computed<'image' | 'pdf' | 'doc' | 'none'>(() => {
  if (!previewUrl.value || !attachedFile.value) return 'none'
  const mime = attachedFile.value.type.toLowerCase()
  if (mime.startsWith('image/')) return 'image'
  if (mime === 'application/pdf') return 'pdf'
  if (mime.includes('word') || mime.includes('officedocument')) return 'doc'
  return 'none'
})

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

watch(() => props.open, (val) => {
  if (val) {
    const newMinDate = getMinDatePlus10Mins()
    minDate.value = newMinDate 
    form.value = { 
      nombre_material: '', 
      descripcion: '', 
      tipo_material_archivo: 'DOCUMENTO', 
      tipo_material_externo: 'PAGINA_EXTERNA',
      enlace_acceso: '',
      fecha_publicacion: newMinDate 
    }
    attachedFile.value = null
    errorMessage.value = ''
    isDragging.value = false
    modalTab.value = 'archivo'
  }
})

const switchTab = (tab: 'archivo' | 'externo') => {
  modalTab.value = tab
  errorMessage.value = ''
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    attachedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    attachedFile.value = event.dataTransfer.files[0]
  }
}

const saveMaterial = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const isoDate = form.value.fecha_publicacion.toISOString()
    
    if (modalTab.value === 'archivo') {
      const payload: MaterialArchivoCreateDTO = {
        nombre_material: form.value.nombre_material.trim(),
        descripcion: form.value.descripcion || null,
        tipo_material: form.value.tipo_material_archivo,
        fecha_publicacion: isoDate,
        file: attachedFile.value as File
      }
      await materialesService.crearMaterialArchivo(payload)
    } else {
      const payload: MaterialExternoCreateDTO = {
        nombre_material: form.value.nombre_material.trim(),
        descripcion: form.value.descripcion || null,
        tipo_material: form.value.tipo_material_externo,
        fecha_publicacion: isoDate,
        enlace_acceso: form.value.enlace_acceso.trim()
      }
      await materialesService.crearMaterialExterno(payload)
    }
    
    emit('saved')
  } catch (err: any) {
    extractError(err, 'Error al crear el material. Revise los datos enviados.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <Card class="w-full max-w-4xl border-gray-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
      <CardHeader class="border-b border-gray-100 pb-3 shrink-0">
        <CardTitle class="flex items-center justify-between text-base font-bold text-slate-800">
          <span>Añadir Nuevo Material</span>
          <button @click="emit('close')" class="rounded-md p-1 text-slate-500 hover:bg-gray-100 transition-colors">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>

      <div class="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-112.5">
        <div class="shrink-0 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col p-4 items-center justify-center w-full sm:w-64">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 w-full text-center">Vista Previa</p>
          <div class="w-56 h-72 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center relative shrink-0">
            <template v-if="previewUrl && modalTab === 'archivo'">
              <img v-if="fileType === 'image'" :src="previewUrl" class="w-full h-full object-cover" />
              <div v-else-if="fileType === 'pdf'" class="w-full h-full overflow-hidden flex items-center justify-center bg-gray-100">
                <VuePdfEmbed :source="previewUrl" :page="1" class="w-full h-full object-contain" />
              </div>
              <div v-else-if="fileType === 'doc'" class="flex flex-col items-center justify-center p-4 text-center h-full w-full bg-blue-50/30">
                <div class="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <FileText class="h-7 w-7 text-blue-600" />
                </div>
                <p class="text-xs font-bold text-blue-900 mb-1">Documento Word</p>
                <p class="text-[10px] text-gray-500 leading-tight">Previsualización no disponible.</p>
              </div>
            </template>
            <template v-else-if="modalTab === 'externo'">
              <div class="text-center p-4">
                <div class="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <LinkIcon class="h-6 w-6 text-indigo-400" />
                </div>
                <p class="text-xs font-bold text-indigo-800 mb-1">Enlace Externo</p>
                <p class="text-[10px] text-gray-500 leading-tight break-all px-2">{{ form.enlace_acceso || 'Sin enlace definido' }}</p>
              </div>
            </template>
            <template v-else>
              <div class="text-center p-4">
                <ImageIcon class="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p class="text-[11px] text-gray-400 font-medium leading-tight">Sin selección o no aplicable</p>
              </div>
            </template>
          </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden w-full relative">
          
          <div class="flex border-b border-gray-200 text-xs sm:text-sm shrink-0 bg-gray-50/50">
            <button 
              type="button" 
              class="flex-1 py-3 font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5" 
              :class="modalTab === 'archivo' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'" 
              @click="switchTab('archivo')"
            >
              <UploadCloud class="h-4 w-4" /> Subir Archivo
            </button>
            <button 
              type="button" 
              class="flex-1 py-3 font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5" 
              :class="modalTab === 'externo' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'" 
              @click="switchTab('externo')"
            >
              <LinkIcon class="h-4 w-4" /> Enlace Externo
            </button>
          </div>

          <CardContent class="pt-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
            <transition name="slide">
              <div v-if="errorMessage" class="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3 shadow-sm shrink-0">
                <AlertCircle class="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div class="flex-1 min-w-0">
                  <h4 class="text-[11px] font-bold text-red-700 uppercase tracking-wider">Error al procesar</h4>
                  <p class="text-xs text-red-600 font-medium wrap-break-word whitespace-pre-wrap">{{ errorMessage }}</p>
                </div>
                <button @click="errorMessage = ''" class="text-red-500 hover:text-red-700 transition-colors shrink-0">
                  <X class="h-3 w-3" />
                </button>
              </div>
            </transition>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-800 mb-1.5">Nombre del Material <span class="text-red-500">*</span></label>
                <input v-model="form.nombre_material" type="text" placeholder="Ej: Práctica de Algoritmos" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-800 mb-1.5">Tipo de Material <span class="text-red-500">*</span></label>
                  
                  <select v-if="modalTab === 'archivo'" v-model="form.tipo_material_archivo" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                    <option value="DOCUMENTO">DOCUMENTO GENERAL</option>
                    <option value="EXAMEN">EXAMEN</option>
                    <option value="SOLUCIONARIO">SOLUCIONARIO</option>
                    <option value="EJERCICIOS">EJERCICIOS</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                  
                  <select v-else v-model="form.tipo_material_externo" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                    <option value="PAGINA_EXTERNA">PAGINA EXTERNA</option>
                    <option value="DOCUMENTO_EXTERNO">DOCUMENTO EXTERNO</option>
                    <option value="ARCHIVO_EXTERNO">ARCHIVO EXTERNO</option>
                    <option value="VIDEO_EXTERNO">VIDEO EXTERNO</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-800 mb-1.5">Fecha de Publicación <span class="text-red-500">*</span></label>
                  <VDatePicker 
                    v-model="form.fecha_publicacion" 
                    mode="dateTime" 
                    is24hr 
                    hide-time-header
                    :min-date="minDate"
                    :rules="timeRules"
                  >
                    <template #default="{ inputValue, inputEvents }">
                      <div class="relative w-full cursor-pointer">
                        <CalendarIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          :value="inputValue" 
                          v-on="inputEvents" 
                          class="w-full cursor-pointer rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                          placeholder="Seleccionar..." 
                          readonly
                        />
                      </div>
                    </template>
                  </VDatePicker>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-800 mb-1.5">Descripción Corta</label>
                <textarea v-model="form.descripcion" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none" placeholder="Opcional..."></textarea>
              </div>
            </div>

            <div v-if="modalTab === 'archivo'" class="pt-2">
              <label class="block text-sm font-semibold text-slate-800 mb-1.5">Archivo a Subir <span class="text-red-500">*</span></label>
              <div 
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
                :class="[
                  'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all',
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/40 hover:bg-gray-50',
                  attachedFile ? 'bg-green-50/50 border-green-300 hover:border-green-400' : ''
                ]"
              >
                <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" />
                <template v-if="!attachedFile">
                  <UploadCloud class="h-10 w-10 text-gray-400 mb-2" />
                  <p class="text-sm font-bold text-slate-800">Haz clic o arrastra un archivo aquí</p>
                  <p class="text-xs text-slate-500 mt-1">PDF, DOCX, ZIP, JPG, PNG, RAR ...</p>
                </template>
                <template v-else>
                  <FileIcon class="h-10 w-10 text-green-600 mb-2" />
                  <p class="text-sm font-bold text-green-700 text-center break-all">{{ attachedFile.name }}</p>
                  <p class="text-xs text-green-600/80 mt-1">{{ (attachedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                </template>
              </div>
            </div>

            <div v-if="modalTab === 'externo'" class="pt-2">
              <label class="block text-sm font-semibold text-slate-800 mb-1.5">URL / Enlace <span class="text-red-500">*</span></label>
              <div class="relative">
                <LinkIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input v-model="form.enlace_acceso" type="url" placeholder="https://ejemplo.com/recurso" class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
              </div>
            </div>

          </CardContent>

          <div class="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3 mt-auto">
            <Button variant="outline" @click="emit('close')" :disabled="isSubmitting">Cancelar</Button>
            <Button variant="accent" @click="saveMaterial" :disabled="isSubmitting || !isFormValid">
              <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
              {{ isSubmitting ? 'Procesando...' : 'Añadir Material' }}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
:deep(.vc-container) {
  --vc-font-family: var(--font-sans);
  border: 1px solid #e5e7eb;
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>