<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, UploadCloud, Link as LinkIcon, File as FileIcon, Calendar as CalendarIcon } from 'lucide-vue-next'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/style.css'

import { materialesService } from '@/modules/material/services/material.service'
import type { TipoMaterialEnum, MaterialArchivoCreateDTO, MaterialExternoCreateDTO } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{ convocatoriaId: number }>()
const emit = defineEmits(['refresh'])

const isOpen = ref(false)
const modalTab = ref<'archivo' | 'externo'>('archivo')
const isSubmitting = ref(false)
const localError = ref('')

// Función para obtener la hora actual + 10 minutos
const getMinDatePlus10Mins = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 10)
  return date
}

const minDate = ref(getMinDatePlus10Mins())

// Reglas para bloquear horas y minutos en VCalendar si se selecciona el día de hoy
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

// Formulario reactivo
const form = ref({
  nombre_material: '',
  descripcion: '',
  tipo_material_archivo: 'DOCUMENTO' as TipoMaterialEnum,
  tipo_material_externo: 'PAGINA_EXTERNA' as TipoMaterialEnum,
  enlace_acceso: '',
  fecha_publicacion: getMinDatePlus10Mins() // <-- CORRECCIÓN: Inicializamos con Date válido en lugar de null
})

// Variables para el Drag and Drop
const fileInput = ref<HTMLInputElement | null>(null)
const attachedFile = ref<File | null>(null)
const isDragging = ref(false)

// Validación Computada para bloquear el botón de Guardar
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

const openModal = () => {
  const newMinDate = getMinDatePlus10Mins()
  minDate.value = newMinDate 
  
  form.value = { 
    nombre_material: '', 
    descripcion: '', 
    tipo_material_archivo: 'DOCUMENTO', 
    tipo_material_externo: 'PAGINA_EXTERNA', 
    enlace_acceso: '', 
    fecha_publicacion: newMinDate // <-- CORRECCIÓN: Evita inicializar en null
  }
  attachedFile.value = null
  localError.value = ''
  modalTab.value = 'archivo'
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

// Lógica de Archivos
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

// Guardar (Subir o Enlazar)
const saveMaterial = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  localError.value = ''

  try {
    const isoDate = form.value.fecha_publicacion.toISOString()
    let materialCreadoId: number

    if (modalTab.value === 'archivo') {
      const payload: MaterialArchivoCreateDTO = {
        nombre_material: form.value.nombre_material.trim(),
        descripcion: form.value.descripcion || null,
        tipo_material: form.value.tipo_material_archivo,
        fecha_publicacion: isoDate,
        file: attachedFile.value as File
      }
      const res = await materialesService.crearMaterialArchivo(payload)
      materialCreadoId = res.data.id_material
    } else {
      const payload: MaterialExternoCreateDTO = {
        nombre_material: form.value.nombre_material.trim(),
        descripcion: form.value.descripcion || null,
        tipo_material: form.value.tipo_material_externo,
        fecha_publicacion: isoDate,
        enlace_acceso: form.value.enlace_acceso.trim()
      }
      const res = await materialesService.crearMaterialExterno(payload)
      materialCreadoId = res.data.id_material
    }

    await materialesService.ligarConvocatoria(materialCreadoId, props.convocatoriaId)

    emit('refresh')
    closeModal()
  } catch (err: any) {
    console.error('Error detallado de API:', err.response?.data || err)
    
    const responseData = err.response?.data
    if (responseData) {
      if (typeof responseData === 'string') {
        localError.value = responseData
      } else {
        localError.value = responseData.error 
          || responseData.message 
          || (Array.isArray(responseData.detail) ? 'Error de validación: Revise los datos enviados.' : responseData.detail)
          || JSON.stringify(responseData)
      }
    } else {
      localError.value = err.message || 'Error de conexión.'
    }
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({ openModal })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
    <Card class="w-full max-w-lg border-gray-200 bg-white shadow-xl">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <span>Añadir Material al Repositorio</span>
          <button @click="closeModal" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent class="pt-4 space-y-5">
        <div class="flex rounded-lg border border-gray-200 bg-gray-50/50 p-1">
          <button
            @click="modalTab = 'archivo'; localError=''"
            :class="['flex-1 flex justify-center items-center gap-2 rounded-md py-2 text-xs font-semibold transition-all', modalTab === 'archivo' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main']"
          >
            <UploadCloud class="h-4 w-4" /> Subir Archivo
          </button>
          <button
            @click="modalTab = 'externo'; localError=''"
            :class="['flex-1 flex justify-center items-center gap-2 rounded-md py-2 text-xs font-semibold transition-all', modalTab === 'externo' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main']"
          >
            <LinkIcon class="h-4 w-4" /> Enlace Externo
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-text-main mb-1.5">Nombre del Material <span class="text-error">*</span></label>
            <input v-model="form.nombre_material" type="text" placeholder="Ej: Práctica de Algoritmos" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">Clasificación <span class="text-error">*</span></label>
              <select v-if="modalTab === 'archivo'" v-model="form.tipo_material_archivo" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                <option value="DOCUMENTO">DOCUMENTO</option>
                <option value="VIDEO">VIDEO</option>
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
              <label class="block text-sm font-semibold text-text-main mb-1.5">Fecha y Hora <span class="text-error">*</span></label>
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
            <label class="block text-sm font-semibold text-text-main mb-1.5">Descripción Corta</label>
            <textarea v-model="form.descripcion" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none" placeholder="Opcional..."></textarea>
          </div>
        </div>

        <div v-if="modalTab === 'archivo'">
          <label class="block text-sm font-semibold text-text-main mb-1.5">Archivo a Subir <span class="text-error">*</span></label>
          <div 
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
            :class="[
              'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all',
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/40 hover:bg-gray-50',
              attachedFile ? 'bg-success/5 border-success/30 hover:border-success/50' : ''
            ]"
          >
            <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" />
            <template v-if="!attachedFile">
              <UploadCloud class="h-10 w-10 text-gray-400 mb-2" />
              <p class="text-sm font-bold text-text-main">Haz clic o arrastra un archivo aquí</p>
              <p class="text-xs text-text-muted mt-1">PDF, DOCX, ZIP, MP4, JPG, PNG...</p>
            </template>
            <template v-else>
              <FileIcon class="h-10 w-10 text-success mb-2" />
              <p class="text-sm font-bold text-success text-center break-all">{{ attachedFile.name }}</p>
              <p class="text-xs text-success/80 mt-1">{{ (attachedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
            </template>
          </div>
        </div>

        <div v-if="modalTab === 'externo'">
          <label class="block text-sm font-semibold text-text-main mb-1.5">URL / Enlace <span class="text-error">*</span></label>
          <div class="relative">
            <LinkIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="form.enlace_acceso" type="url" placeholder="https://ejemplo.com/recurso" class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
        </div>

        <div v-if="localError" class="rounded-lg border border-error/20 bg-error/10 p-3 text-xs font-semibold text-error text-center break-words">
          {{ localError }}
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" @click="closeModal" :disabled="isSubmitting">Cancelar</Button>
          <Button variant="accent" @click="saveMaterial" :disabled="isSubmitting || !isFormValid">
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            {{ isSubmitting ? 'Guardando...' : 'Añadir Material' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
:deep(.vc-container) {
  --vc-font-family: var(--font-sans);
  border: 1px solid #e5e7eb;
}
</style>