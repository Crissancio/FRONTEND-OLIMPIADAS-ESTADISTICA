<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Edit3, Save, Ban, Eye, EyeOff, Calendar as CalendarIcon, Link as LinkIcon, FileText, Unlink, AlertCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/style.css'

import { materialesService } from '@/modules/material/services/material.service'
import type { MaterialDetalleDTO, MaterialUpdateDTO, TipoMaterialEnum } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{
  open: boolean
  material: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const activeTab = ref<'general' | 'referencias'>('general')
const isLoading = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isTogglingStatus = ref(false)
const isDeleting = ref(false)
const isUnlinking = ref(false)
const showDeleteConfirm = ref(false)
const localError = ref('')

const currentMaterial = ref<MaterialDetalleDTO | null>(null)

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
  if (!currentMaterial.value) return 'GENERAL'
  if (TIPOS_PRINCIPALES.includes(currentMaterial.value.tipo_material)) return 'PRINCIPAL'
  if (TIPOS_EXTERNOS.includes(currentMaterial.value.tipo_material)) return 'EXTERNO'
  return 'GENERAL'
})

const isPrincipal = computed(() => TIPOS_PRINCIPALES.includes(currentMaterial.value?.tipo_material || ''))
const isPublic = computed(() => currentMaterial.value?.estado === 'PUBLICO')
const canEditBasic = computed(() => isEditing.value)
const canEditAdvanced = computed(() => isEditing.value && !isPublic.value)

const isFormValid = computed(() => {
  if (!form.value.nombre_material.trim()) return false
  if (!form.value.descripcion.trim()) return false
  if (canEditAdvanced.value && categoryType.value !== 'PRINCIPAL' && !form.value.fecha_publicacion) return false
  if (canEditAdvanced.value && categoryType.value === 'EXTERNO' && !form.value.enlace_acceso.trim()) return false
  return true
})

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    localError.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  localError.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const loadMaterialData = async (idMaterial: number) => {
  isLoading.value = true
  localError.value = ''
  try {
    const res = await materialesService.obtenerMaterialPorId(idMaterial)
    currentMaterial.value = res.data
    populateForm()
  } catch (err: any) {
    extractError(err, 'Error al obtener la información del material.')
  } finally {
    isLoading.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen && props.material) {
    activeTab.value = 'general'
    isEditing.value = false
    showDeleteConfirm.value = false
    localError.value = ''
    loadMaterialData(props.material.id_material)
  }
})

const populateForm = () => {
  if (!currentMaterial.value) return
  minDate.value = getMinDatePlus10Mins()
  const fetchedDate = currentMaterial.value.fecha_publicacion ? new Date(currentMaterial.value.fecha_publicacion) : getMinDatePlus10Mins()
  
  form.value = {
    nombre_material: currentMaterial.value.nombre_material,
    descripcion: currentMaterial.value.descripcion || '',
    tipo_material: currentMaterial.value.tipo_material,
    fecha_publicacion: fetchedDate,
    enlace_acceso: currentMaterial.value.enlace_acceso || ''
  }
}

const closeModal = () => {
  currentMaterial.value = null
  showDeleteConfirm.value = false
  emit('close')
}

const toggleEdit = () => {
  if (isEditing.value) {
    populateForm()
    localError.value = ''
  }
  isEditing.value = !isEditing.value
}

const saveChanges = async () => {
  if (!isFormValid.value || !currentMaterial.value) return
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

    const res = await materialesService.actualizarMaterial(currentMaterial.value.id_material, payload)
    currentMaterial.value = { ...currentMaterial.value, ...res.data }
    isEditing.value = false
    emit('updated')
  } catch (err: any) {
    extractError(err, 'Error al guardar los cambios del material.')
  } finally {
    isSubmitting.value = false
  }
}

const toggleStatus = async () => {
  if (!currentMaterial.value) return
  isTogglingStatus.value = true
  localError.value = ''
  
  try {
    if (currentMaterial.value.estado === 'PUBLICO') {
      await materialesService.ocultarMaterial(currentMaterial.value.id_material)
      currentMaterial.value.estado = 'OCULTO'
    } else {
      await materialesService.publicarMaterial(currentMaterial.value.id_material)
      currentMaterial.value.estado = 'PUBLICO'
    }
    emit('updated')
  } catch (err: any) {
    extractError(err, 'Error al cambiar el estado del material.')
  } finally {
    isTogglingStatus.value = false
  }
}

const confirmDelete = async () => {
  if (!currentMaterial.value) return
  isDeleting.value = true
  localError.value = ''
  
  try {
    await materialesService.eliminarMaterial(currentMaterial.value.id_material)
    emit('updated')
    closeModal()
  } catch (err: any) {
    extractError(err, 'Error al eliminar el material permanentemente.')
    showDeleteConfirm.value = false
  } finally {
    isDeleting.value = false
  }
}

const unlinkFase = async (idFase: number) => {
  if (!currentMaterial.value) return
  isUnlinking.value = true
  localError.value = ''
  try {
    await materialesService.desligarFase(currentMaterial.value.id_material, idFase)
    await loadMaterialData(currentMaterial.value.id_material)
    emit('updated')
  } catch (err: any) {
    extractError(err, 'Error al desligar la fase.')
  } finally {
    isUnlinking.value = false
  }
}

const unlinkConvocatoria = async (idConvocatoria: number) => {
  if (!currentMaterial.value) return
  isUnlinking.value = true
  localError.value = ''
  try {
    await materialesService.desligarConvocatoria(currentMaterial.value.id_material, idConvocatoria)
    await loadMaterialData(currentMaterial.value.id_material)
    emit('updated')
  } catch (err: any) {
    extractError(err, 'Error al desligar la convocatoria.')
  } finally {
    isUnlinking.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
    <Card class="w-full max-w-lg border-gray-200 bg-white shadow-xl relative overflow-visible my-auto flex flex-col max-h-[90vh]">
      
      <transition name="fade">
        <div v-if="showDeleteConfirm" class="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-xl">
          <div class="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle class="h-8 w-8" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Eliminar Permanentemente</h3>
          <p class="text-sm text-slate-500 mb-6 max-w-70">
            Esta acción es <strong>irreversible</strong>. El material será eliminado del sistema y desaparecerá de todas las fases y convocatorias a las que esté vinculado.
          </p>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" @click="showDeleteConfirm = false" :disabled="isDeleting" class="flex-1 w-full sm:w-32">
              Cancelar
            </Button>
            <Button variant="accent" @click="confirmDelete" :disabled="isDeleting" class="flex-1 w-full sm:w-32 bg-red-600 hover:bg-red-700 text-white border-transparent">
              <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin mr-2" />
              <Trash2 v-else class="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </transition>

      <CardHeader class="border-b border-gray-100 pb-4 shrink-0">
        <CardTitle class="flex items-center justify-between text-base font-bold text-slate-800">
          <div class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            <span>Administrar Material</span>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="!isLoading && activeTab === 'general'" @click="toggleEdit" :class="['rounded-md p-1.5 transition-colors', isEditing ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-gray-100']">
              <Edit3 class="h-5 w-5 stroke-[2.5px]" />
            </button>
            <button @click="closeModal" class="rounded-md p-1.5 text-slate-500 hover:bg-gray-100 transition-colors">
              <X class="h-5 w-5 stroke-[2.5px]" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <div v-if="!isLoading && currentMaterial" class="flex border-b border-gray-200 text-sm bg-gray-50/50 shrink-0">
        <button 
          @click="activeTab = 'general'" 
          :class="activeTab === 'general' ? 'border-primary text-primary bg-white' : 'text-slate-500 border-transparent hover:text-slate-800'" 
          class="flex-1 py-3 font-bold border-b-2 transition-colors"
        >
          Información General
        </button>
        <button 
          @click="activeTab = 'referencias'" 
          :class="activeTab === 'referencias' ? 'border-primary text-primary bg-white' : 'text-slate-500 border-transparent hover:text-slate-800'" 
          class="flex-1 py-3 font-bold border-b-2 transition-colors"
        >
          Referencias
        </button>
      </div>

      <CardContent class="pt-4 flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="isLoading" class="py-10 text-center text-sm text-slate-500 flex flex-col items-center">
          <Loader2 class="h-6 w-6 animate-spin text-primary mb-2" />
          Cargando información del material...
        </div>

        <div v-else-if="currentMaterial">
          
          <transition name="slide">
            <div v-if="localError" class="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3 shadow-sm mb-4">
              <AlertCircle class="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div class="flex-1 min-w-0">
                <h4 class="text-[11px] font-bold text-red-700 uppercase tracking-wider">Error</h4>
                <p class="text-xs text-red-600 font-medium wrap-break-word whitespace-pre-wrap">{{ localError }}</p>
              </div>
              <button @click="localError = ''" class="text-red-500 hover:text-red-700 transition-colors shrink-0">
                <X class="h-3 w-3" />
              </button>
            </div>
          </transition>

          <div v-if="activeTab === 'general'" class="space-y-4">
            <div v-if="isPublic && isEditing" class="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 font-medium border border-blue-200">
              Este material está PUBLICADO. Solo puede modificar su nombre y descripción básica.
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-800 mb-1.5">Nombre del Material <span v-if="isEditing" class="text-red-500">*</span></label>
              <input v-model="form.nombre_material" type="text" :disabled="!canEditBasic" :class="['w-full rounded-lg border px-3 py-2.5 text-sm transition-all', canEditBasic ? 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white' : 'border-transparent bg-gray-50 text-slate-700 font-medium']" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-800 mb-1.5">Descripción <span v-if="isEditing" class="text-red-500">*</span></label>
              <textarea v-model="form.descripcion" rows="2" :disabled="!canEditBasic" :class="['w-full rounded-lg border px-3 py-2.5 text-sm transition-all resize-none', canEditBasic ? 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white' : 'border-transparent bg-gray-50 text-slate-700 font-medium']"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-slate-800 mb-1.5">Clasificación <span v-if="canEditAdvanced" class="text-red-500">*</span></label>
                <select v-if="canEditAdvanced && categoryType === 'GENERAL'" v-model="form.tipo_material" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                  <option v-for="t in TIPOS_GENERAL" :key="t" :value="t">{{ t }}</option>
                </select>
                <select v-else-if="canEditAdvanced && categoryType === 'EXTERNO'" v-model="form.tipo_material" class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                  <option v-for="t in TIPOS_EXTERNOS" :key="t" :value="t">{{ t.replace('_', ' ') }}</option>
                </select>
                <div v-else class="w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                  {{ form.tipo_material.replace('_', ' ') }}
                </div>
              </div>

              <div v-if="categoryType !== 'PRINCIPAL'">
                <label class="block text-sm font-semibold text-slate-800 mb-1.5">Fecha de Publicación <span v-if="canEditAdvanced" class="text-red-500">*</span></label>
                <VDatePicker v-if="canEditAdvanced" v-model="form.fecha_publicacion" mode="dateTime" is24hr hide-time-header :min-date="minDate" :rules="timeRules">
                  <template #default="{ inputValue, inputEvents }">
                    <div class="relative w-full cursor-pointer">
                      <CalendarIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input :value="inputValue" v-on="inputEvents" class="w-full cursor-pointer rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" readonly />
                    </div>
                  </template>
                </VDatePicker>
                <div v-else class="w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarIcon class="h-4 w-4 text-gray-400" />
                  {{ new Date(form.fecha_publicacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) }}
                </div>
              </div>
            </div>

            <div v-if="categoryType === 'EXTERNO'">
              <label class="block text-sm font-semibold text-slate-800 mb-1.5">URL / Enlace <span v-if="canEditAdvanced" class="text-red-500">*</span></label>
              <div v-if="canEditAdvanced" class="relative">
                <LinkIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input v-model="form.enlace_acceso" type="url" class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" />
              </div>
              <div v-else class="w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-sm font-medium text-slate-700 truncate flex items-center gap-2">
                <LinkIcon class="h-4 w-4 text-gray-400 shrink-0" />
                <a :href="form.enlace_acceso" target="_blank" class="text-blue-600 hover:underline">{{ form.enlace_acceso }}</a>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'referencias'" class="space-y-6">
            <div>
              <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                Convocatorias Vinculadas
              </h4>
              <div v-if="currentMaterial.convocatorias?.length" class="space-y-2">
                <div v-for="conv in currentMaterial.convocatorias" :key="conv.id_convocatoria" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div class="min-w-0 pr-2">
                    <p class="text-sm font-bold text-slate-700 truncate" :title="conv.nombre_convocatoria">{{ conv.nombre_convocatoria }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">Gestión: <span class="font-semibold">{{ conv.gestion }}</span></p>
                  </div>
                  <Button v-if="!isPrincipal" variant="ghost" size="icon" :disabled="isUnlinking" class="shrink-0 text-orange-500 hover:bg-orange-50 hover:text-orange-700 h-8 w-8" @click="unlinkConvocatoria(conv.id_convocatoria)">
                    <Unlink class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div v-else class="p-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                <p class="text-sm text-slate-500 italic">No hay convocatorias vinculadas.</p>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                Fases Vinculadas
              </h4>
              <div v-if="currentMaterial.fases?.length" class="space-y-2">
                <div v-for="fase in currentMaterial.fases" :key="fase.id_fase" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div class="min-w-0 pr-2">
                    <p class="text-sm font-bold text-slate-700 truncate" :title="fase.nombre_fase">{{ fase.nombre_fase }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">Categoría: <span class="font-semibold">{{ fase.nombre_categoria }}</span></p>
                  </div>
                  <Button v-if="!isPrincipal" variant="ghost" size="icon" :disabled="isUnlinking" class="shrink-0 text-orange-500 hover:bg-orange-50 hover:text-orange-700 h-8 w-8" @click="unlinkFase(fase.id_fase)">
                    <Unlink class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div v-else class="p-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                <p class="text-sm text-slate-500 italic">No hay fases vinculadas.</p>
              </div>
            </div>
          </div>

        </div>
      </CardContent>

      <div v-if="currentMaterial" class="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center mt-auto">
        <div v-if="activeTab === 'general' && !isEditing" class="flex gap-2 flex-wrap">
          <template v-if="!isPrincipal">
            <Button variant="outline" @click="toggleStatus" :disabled="isTogglingStatus" :class="isPublic ? 'text-orange-600 hover:bg-orange-50 border-gray-200' : 'text-green-600 hover:bg-green-50 border-gray-200'">
              <Loader2 v-if="isTogglingStatus" class="h-4 w-4 animate-spin mr-2" />
              <component v-else :is="isPublic ? EyeOff : Eye" class="h-4 w-4 mr-2" />
              {{ isPublic ? 'Ocultar' : 'Publicar' }}
            </Button>
            
            <Button variant="outline" @click="showDeleteConfirm = true" class="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-colors">
              <Trash2 class="h-4 w-4 mr-2" /> Eliminar
            </Button>
          </template>
          <template v-else>
            <div class="text-xs text-slate-500 italic py-1 px-1">
              * Acciones de estado/eliminación restringidas.
            </div>
          </template>
        </div>

        <div v-if="activeTab === 'general' && isEditing" class="flex gap-2 w-full justify-end">
          <Button variant="outline" @click="toggleEdit" :disabled="isSubmitting">
            <Ban class="h-4 w-4 mr-1.5" /> Cancelar
          </Button>
          <Button variant="accent" @click="saveChanges" :disabled="isSubmitting || !isFormValid">
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-2" />
            <Save v-else class="h-4 w-4 mr-1.5" /> Guardar
          </Button>
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
.slide-enter-active, .slide-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>