<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Edit3, Save, Ban, Eye, EyeOff, Calendar as CalendarIcon, Link as LinkIcon, FileText, Trash2 } from 'lucide-vue-next'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/style.css'

import { materialesService } from '@/modules/material/services/material.service'
import type { MaterialDetalleDTO, MaterialUpdateDTO, TipoMaterialEnum } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const emit = defineEmits(['refresh'])

const isOpen = ref(false)
const isLoading = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isTogglingStatus = ref(false)
const isDeleting = ref(false)
const localError = ref('')

const material = ref<MaterialDetalleDTO | null>(null)

const TIPOS_GENERAL = ['EXAMEN', 'SOLUCIONARIO', 'EJERCICIOS', 'DOCUMENTO', 'OTRO']
const TIPOS_PRINCIPALES = ['AFICHE', 'CONVOCATORIA', 'REGLAMENTO']
const TIPOS_EXTERNOS = ['DOCUMENTO_EXTERNO', 'ARCHIVO_EXTERNO', 'PAGINA_EXTERNA', 'VIDEO_EXTERNO']

const form = ref({
  nombre_material: '',
  descripcion: '',
  tipo_material: 'DOCUMENTO' as TipoMaterialEnum,
  fecha_publicacion: new Date(),
  enlace_acceso: ''
})

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

const categoryType = computed(() => {
  if (!material.value) return 'GENERAL'
  if (TIPOS_PRINCIPALES.includes(material.value.tipo_material)) return 'PRINCIPAL'
  if (TIPOS_EXTERNOS.includes(material.value.tipo_material)) return 'EXTERNO'
  return 'GENERAL'
})

const isPublic = computed(() => material.value?.estado === 'PUBLICO')
const canEditBasic = computed(() => isEditing.value)
const canEditAdvanced = computed(() => isEditing.value && !isPublic.value)

const isFormValid = computed(() => {
  if (!form.value.nombre_material.trim()) return false
  if (!form.value.descripcion.trim()) return false
  if (canEditAdvanced.value && categoryType.value !== 'PRINCIPAL' && !form.value.fecha_publicacion) return false
  if (canEditAdvanced.value && categoryType.value === 'EXTERNO' && !form.value.enlace_acceso.trim()) return false
  return true
})

const openModal = async (idMaterial: number) => {
  isOpen.value = true
  isLoading.value = true
  isEditing.value = false
  localError.value = ''
  
  try {
    const res = await materialesService.obtenerMaterialPorId(idMaterial)
    material.value = res.data
    populateForm()
  } catch (err: any) {
    handleError(err)
  } finally {
    isLoading.value = false
  }
}

const populateForm = () => {
  if (!material.value) return
  minDate.value = getMinDatePlus10Mins()
  
  const fetchedDate = material.value.fecha_publicacion ? new Date(material.value.fecha_publicacion) : getMinDatePlus10Mins()
  
  form.value = {
    nombre_material: material.value.nombre_material,
    descripcion: material.value.descripcion || '',
    tipo_material: material.value.tipo_material,
    fecha_publicacion: fetchedDate,
    enlace_acceso: material.value.enlace_acceso || ''
  }
}

const closeModal = () => {
  isOpen.value = false
  material.value = null
}

const toggleEdit = () => {
  if (isEditing.value) {
    populateForm()
    localError.value = ''
  }
  isEditing.value = !isEditing.value
}

const handleError = (err: any) => {
  const responseData = err.response?.data
  if (responseData) {
    if (typeof responseData === 'string') {
      localError.value = responseData
    } else {
      localError.value = responseData.error 
        || responseData.message 
        || (Array.isArray(responseData.detail) ? 'Verifique que los datos sean correctos.' : responseData.detail)
        || JSON.stringify(responseData)
    }
  } else {
    localError.value = err.message || 'Error de conexión.'
  }
}

const saveChanges = async () => {
  if (!isFormValid.value || !material.value) return
  
  isSubmitting.value = true
  localError.value = ''

  try {
    const payload: MaterialUpdateDTO = {
      nombre_material: form.value.nombre_material.trim(),
      descripcion: form.value.descripcion.trim()
    }

    if (canEditAdvanced.value) {
      payload.tipo_material = form.value.tipo_material
      if (categoryType.value !== 'PRINCIPAL') {
        payload.fecha_publicacion = form.value.fecha_publicacion.toISOString()
      }
      if (categoryType.value === 'EXTERNO') {
        payload.enlace_acceso = form.value.enlace_acceso.trim()
      }
    }

    const res = await materialesService.actualizarMaterial(material.value.id_material, payload)
    material.value = { ...material.value, ...res.data }
    isEditing.value = false
    emit('refresh')
  } catch (err: any) {
    handleError(err)
  } finally {
    isSubmitting.value = false
  }
}

const toggleStatus = async () => {
  if (!material.value) return
  
  isTogglingStatus.value = true
  localError.value = ''
  
  try {
    if (material.value.estado === 'PUBLICO') {
      await materialesService.ocultarMaterial(material.value.id_material)
      material.value.estado = 'OCULTO'
    } else {
      await materialesService.publicarMaterial(material.value.id_material)
      material.value.estado = 'PUBLICO'
    }
    emit('refresh')
  } catch (err: any) {
    handleError(err)
  } finally {
    isTogglingStatus.value = false
  }
}

const deleteMaterial = async () => {
  if (!material.value) return
  
  const confirmDelete = window.confirm(
    '⚠️ ATENCIÓN:\n\n¿Está seguro de que desea eliminar este material permanentemente?\nEsta acción no se puede deshacer y el archivo se perderá para siempre.'
  )
  
  if (!confirmDelete) return
  
  isDeleting.value = true
  localError.value = ''
  
  try {
    await materialesService.eliminarMaterial(material.value.id_material)
    emit('refresh')
    closeModal()
  } catch (err: any) {
    handleError(err)
  } finally {
    isDeleting.value = false
  }
}

defineExpose({ openModal })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
    <Card class="w-full max-w-lg border-gray-200 bg-white shadow-xl">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <div class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            <span>Administrar Material</span>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="!isLoading" @click="toggleEdit" :class="['rounded-md p-1.5 transition-colors', isEditing ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-gray-100']">
              <Edit3 class="h-5 w-5 stroke-[2.5px]" />
            </button>
            <button @click="closeModal" class="rounded-md p-1.5 text-text-muted hover:bg-gray-100 transition-colors">
              <X class="h-5 w-5 stroke-[2.5px]" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent class="pt-4">
        <div v-if="isLoading" class="py-10 text-center animate-pulse text-sm text-text-muted">
          Cargando información del material...
        </div>

        <div v-else-if="material" class="space-y-4">
          
          <div v-if="isPublic && isEditing" class="rounded-lg bg-info/10 p-3 text-xs text-info-dark font-medium border border-info/20">
            Este material está PUBLICADO. Solo puede modificar su nombre y descripción.
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1.5">Nombre del Material <span v-if="isEditing" class="text-error">*</span></label>
            <input v-model="form.nombre_material" type="text" :disabled="!canEditBasic" :class="['w-full rounded-lg border px-3 py-2.5 text-sm transition-all', canEditBasic ? 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none' : 'border-transparent bg-gray-50 text-text-main font-medium']" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1.5">Descripción <span v-if="isEditing" class="text-error">*</span></label>
            <textarea v-model="form.descripcion" rows="2" :disabled="!canEditBasic" :class="['w-full rounded-lg border px-3 py-2.5 text-sm transition-all resize-none', canEditBasic ? 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none' : 'border-transparent bg-gray-50 text-text-main font-medium']"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">Clasificación <span v-if="canEditAdvanced" class="text-error">*</span></label>
              <select v-if="canEditAdvanced && categoryType === 'GENERAL'" v-model="form.tipo_material" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                <option v-for="t in TIPOS_GENERAL" :key="t" :value="t">{{ t }}</option>
              </select>
              <select v-else-if="canEditAdvanced && categoryType === 'EXTERNO'" v-model="form.tipo_material" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                <option v-for="t in TIPOS_EXTERNOS" :key="t" :value="t">{{ t.replace('_', ' ') }}</option>
              </select>
              <div v-else class="w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-sm font-medium text-text-main">
                {{ form.tipo_material.replace('_', ' ') }}
              </div>
            </div>

            <div v-if="categoryType !== 'PRINCIPAL'">
              <label class="block text-sm font-semibold text-text-main mb-1.5">Fecha de Publicación <span v-if="canEditAdvanced" class="text-error">*</span></label>
              <VDatePicker v-if="canEditAdvanced" v-model="form.fecha_publicacion" mode="dateTime" is24hr hide-time-header :min-date="minDate" :rules="timeRules">
                <template #default="{ inputValue, inputEvents }">
                  <div class="relative w-full cursor-pointer">
                    <CalendarIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input :value="inputValue" v-on="inputEvents" class="w-full cursor-pointer rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" readonly />
                  </div>
                </template>
              </VDatePicker>
              <div v-else class="w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-sm font-medium text-text-main flex items-center gap-2">
                <CalendarIcon class="h-4 w-4 text-gray-400" />
                {{ new Date(form.fecha_publicacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) }}
              </div>
            </div>
          </div>

          <div v-if="categoryType === 'EXTERNO'">
            <label class="block text-sm font-semibold text-text-main mb-1.5">URL / Enlace <span v-if="canEditAdvanced" class="text-error">*</span></label>
            <div v-if="canEditAdvanced" class="relative">
              <LinkIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input v-model="form.enlace_acceso" type="url" class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
            </div>
            <div v-else class="w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-sm font-medium text-text-main truncate flex items-center gap-2">
              <LinkIcon class="h-4 w-4 text-gray-400 shrink-0" />
              <a :href="form.enlace_acceso" target="_blank" class="text-secondary hover:underline">{{ form.enlace_acceso }}</a>
            </div>
          </div>

          <div v-if="localError" class="rounded-lg border border-error/20 bg-error/10 p-3 text-xs font-semibold text-error text-center wrap-break-word">
            {{ localError }}
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-gray-100">
            <div v-if="!isEditing" class="flex gap-2">
              <Button variant="outline" @click="toggleStatus" :disabled="isTogglingStatus || isDeleting" :class="isPublic ? 'text-warning hover:bg-warning/10 hover:text-warning border-gray-200' : 'text-success hover:bg-success/10 hover:text-success border-gray-200'">
                <span v-if="isTogglingStatus" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                <component v-else :is="isPublic ? EyeOff : Eye" class="h-4 w-4 mr-2" />
                {{ isPublic ? 'Ocultar Material' : 'Publicar Material' }}
              </Button>
              
              <Button
                variant="outline"
                @click="deleteMaterial"
                :disabled="isDeleting || isTogglingStatus"
                class="
                  text-red-600
                  border-red-300
                  hover:bg-red-50
                  hover:border-red-500
                  hover:text-red-700
                  transition-colors
                "
              >
                <span v-if="isDeleting" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                <Trash2 v-else class="h-4 w-4 mr-2" />
                Eliminar Material
              </Button>
            </div>
            <div v-if="isEditing" class="flex gap-2 w-full justify-end">
              <Button variant="outline" @click="toggleEdit" :disabled="isSubmitting">
                <Ban class="h-4 w-4 mr-1.5" /> Cancelar
              </Button>
              <Button variant="accent" @click="saveChanges" :disabled="isSubmitting || !isFormValid">
                <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                <Save v-else class="h-4 w-4 mr-1.5" /> Guardar
              </Button>
            </div>
          </div>

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