<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { 
  BookOpen, Trophy, AlertCircle, X, CheckSquare, Square, 
  Lock, Unlock, Trash2, Power, PowerOff, CheckCircle 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

import { fasesService } from '@/modules/fases/services/fases.service'
import type { 
  FaseUnionDTO, 
  TipoFase, 
  ModalidadFase,
  EstadoEntidad,
  FasePreparacionUpdateDTO,
  FasePruebaUpdateDTO
} from '@/modules/fases/types/fases.api'

const props = defineProps<{
  categoriaId: number
  fases: FaseUnionDTO[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// --- ESTADOS DEL MODAL ---
const isOpen = ref(false)
const isEditable = ref(false) // Toggle de edición
const isSubmitting = ref(false)
const isUpdatingState = ref(false)
const errorMessage = ref<string | null>(null)

// --- ESTADOS DE ELIMINACIÓN ---
const showDeleteModal = ref(false)
const isDeletingFase = ref(false)

// --- DATOS DE LA FASE ACTUAL ---
const currentId = ref<number | null>(null)
const currentEstado = ref<EstadoEntidad>('BORRADOR')
const isOriginalPruebaFinal = ref(false)

const inicioCalendarRef = ref<any>(null)
const finCalendarRef = ref<any>(null)
const realizacionCalendarRef = ref<any>(null)
const minGlobalDate = ref(new Date(Date.now() + 10 * 60000))

const form = ref({
  tipo: 'PREPARACION' as TipoFase,
  nombre: '',
  descripcion: '',
  modalidad: 'VIRTUAL' as ModalidadFase,
  fecha_inicio: new Date(),
  fecha_fin: new Date(),
  fecha_realizacion: new Date(),
  criterioAprobacion: 51,
  lugarRealizacion: '',
  faseAnteriorId: '' as number | '',
  es_prueba_final: false
})

watch(() => form.value.fecha_inicio, async (newInicio) => {
  if (form.value.tipo === 'PREPARACION' && newInicio) {
    if (!form.value.fecha_fin || form.value.fecha_fin <= newInicio) {
      form.value.fecha_fin = new Date(newInicio.getTime() + 60 * 60000) 
      await nextTick()
      if (finCalendarRef.value) finCalendarRef.value.move(form.value.fecha_fin)
    }
  }
})

const extractError = (err: any, fallbackMsg: string) => {
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const forceCalendarsToCurrentDates = async () => {
  await nextTick()
  if (form.value.tipo === 'PREPARACION') {
    inicioCalendarRef.value?.move(form.value.fecha_inicio)
    finCalendarRef.value?.move(form.value.fecha_fin)
  } else {
    realizacionCalendarRef.value?.move(form.value.fecha_realizacion)
  }
}

// --- ABRIR MODAL EN MODO GESTIÓN ---
const openManage = (fase: FaseUnionDTO) => {
  minGlobalDate.value = new Date(Date.now() + 10 * 60000)
  
  currentId.value = fase.id_fase
  currentEstado.value = fase.estado
  isEditable.value = false // Comienza bloqueado por defecto
  errorMessage.value = null
  
  const isPrueba = fase.tipo_fase === 'PRUEBA'
  isOriginalPruebaFinal.value = isPrueba ? Boolean((fase as any).es_prueba_final) : false

  form.value = {
    tipo: fase.tipo_fase,
    nombre: fase.nombre_fase,
    descripcion: fase.descripcion || '',
    modalidad: fase.modalidad,
    fecha_inicio: fase.tipo_fase === 'PREPARACION' ? new Date(fase.fecha_inicio) : new Date(),
    fecha_fin: fase.tipo_fase === 'PREPARACION' ? new Date(fase.fecha_fin) : new Date(),
    fecha_realizacion: fase.tipo_fase === 'PRUEBA' ? new Date(fase.fecha_realizacion) : new Date(),
    criterioAprobacion: fase.tipo_fase === 'PRUEBA' ? fase.criterio_aprobacion : 51,
    lugarRealizacion: fase.tipo_fase === 'PRUEBA' ? (fase.lugar_realizacion || '') : '',
    faseAnteriorId: fase.tipo_fase === 'PRUEBA' && fase.id_fase_anterior ? fase.id_fase_anterior : '',
    es_prueba_final: isOriginalPruebaFinal.value
  }
  isOpen.value = true
  forceCalendarsToCurrentDates()
}

const close = () => {
  isOpen.value = false
  errorMessage.value = null
}

const fasesPruebaDisponibles = computed(() => {
  return props.fases.filter(f => f.tipo_fase === 'PRUEBA' && f.id_fase !== currentId.value)
})

const minFechaFin = computed(() => {
  return form.value.fecha_inicio 
    ? new Date(form.value.fecha_inicio.getTime() + 5 * 60000)
    : minGlobalDate.value
})

const isFormValid = computed(() => {
  if (!form.value.nombre.trim()) return false
  if (form.value.tipo === 'PREPARACION') {
    if (!form.value.fecha_inicio || !form.value.fecha_fin) return false
    if (form.value.fecha_fin <= form.value.fecha_inicio) return false
  } else {
    if (!form.value.fecha_realizacion) return false
    if (form.value.criterioAprobacion < 0 || form.value.criterioAprobacion > 100) return false
  }
  return true
})

// --- GUARDAR CAMBIOS (EDICIÓN) ---
const handleSave = async () => {
  if (!isFormValid.value || !currentId.value) return
  isSubmitting.value = true
  errorMessage.value = null

  try {
    if (form.value.tipo === 'PREPARACION') {
      const payload: FasePreparacionUpdateDTO = {
        nombre_fase: form.value.nombre,
        descripcion: form.value.descripcion,
        modalidad: form.value.modalidad,
        fecha_inicio: form.value.fecha_inicio.toISOString(),
        fecha_fin: form.value.fecha_fin.toISOString()
      }
      await fasesService.actualizarFasePreparacion(currentId.value, payload)
    } else {
      const payload: FasePruebaUpdateDTO = {
        nombre_fase: form.value.nombre,
        descripcion: form.value.descripcion,
        modalidad: form.value.modalidad,
        criterio_aprobacion: form.value.criterioAprobacion,
        fecha_realizacion: form.value.fecha_realizacion.toISOString(),
        lugar_realizacion: form.value.lugarRealizacion,
        id_fase_anterior: form.value.faseAnteriorId ? Number(form.value.faseAnteriorId) : null,
        es_prueba_final: form.value.es_prueba_final
      }
      await fasesService.actualizarFasePrueba(currentId.value, payload)
    }
    isEditable.value = false
    emit('refresh')
  } catch (error) {
    extractError(error, 'No se pudieron guardar los cambios.')
  } finally {
    isSubmitting.value = false
  }
}

// --- CAMBIAR ESTADO LÓGICO ---
const toggleEstadoLogic = computed(() => {
  if (currentEstado.value === 'BORRADOR') return { label: 'Publicar Fase', next: 'LISTA', icon: CheckCircle, class: 'text-success hover:bg-success-soft' }
  if (currentEstado.value === 'LISTA') return { label: 'Desactivar', next: 'ELIMINADA', icon: PowerOff, class: 'text-warning hover:bg-warning-soft' }
  return { label: 'Restaurar Fase', next: 'LISTA', icon: Power, class: 'text-primary hover:bg-primary-soft' }
})

const changeEstado = async () => {
  if (!currentId.value) return
  isUpdatingState.value = true
  errorMessage.value = null
  try {
    const nextEstado = toggleEstadoLogic.value.next as EstadoEntidad
    await fasesService.cambiarEstadoFase(currentId.value, { estado: nextEstado })
    currentEstado.value = nextEstado
    emit('refresh')
  } catch(error) {
    extractError(error, 'No se pudo cambiar el estado de la fase.')
  } finally {
    isUpdatingState.value = false
  }
}

// --- ELIMINAR FÍSICAMENTE ---
const confirmDelete = async () => {
  if (!currentId.value) return
  isDeletingFase.value = true
  errorMessage.value = null
  try {
    await fasesService.eliminarFaseFisica(currentId.value)
    showDeleteModal.value = false
    emit('refresh')
    close()
  } catch (error) {
    extractError(error, 'No se pudo eliminar permanentemente la fase.')
    showDeleteModal.value = false
  } finally {
    isDeletingFase.value = false
  }
}

const togglePruebaFinal = () => {
  if (!isEditable.value || isOriginalPruebaFinal.value) return
  form.value.es_prueba_final = !form.value.es_prueba_final
}

defineExpose({ openManage, close })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
    <Card class="w-full max-w-3xl border-gray-200 bg-white shadow-xl animate-fade-in my-auto relative overflow-hidden">
      
      <CardHeader class="border-b border-gray-100 pb-4 bg-gray-50/50">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <div class="flex items-center gap-3">
            <span>Gestión de Fase</span>
            <Badge 
              variant="not_allowed" 
              class="text-[10px] uppercase tracking-wider"
              :class="{
                'bg-gray-200 text-gray-700 border-gray-300': currentEstado === 'BORRADOR',
                'bg-success-soft text-success border-success/30': currentEstado === 'LISTA',
                'bg-danger-soft text-danger border-danger/30': currentEstado === 'ELIMINADA'
              }"
            >
              {{ currentEstado }}
            </Badge>
          </div>
          <button @click="close" class="rounded-md p-1 text-text-muted hover:bg-gray-200 transition-colors">
            <X class="h-5 w-5" />
          </button>
        </CardTitle>
      </CardHeader>

      <div class="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-white shadow-xs z-10 relative">
        <div class="flex items-center gap-2">
          <Button 
            variant="not_allowed" 
            size="sm" 
            class="flex items-center gap-2"
            :class="isEditable ? 'border-primary text-primary bg-primary-soft' : 'text-text-muted'"
            @click="isEditable = !isEditable"
          >
            <Unlock v-if="isEditable" class="h-4 w-4" />
            <Lock v-else class="h-4 w-4" />
            {{ isEditable ? 'Edición Habilitada' : 'Habilitar Edición' }}
          </Button>

          <Button 
            variant="not_allowed" 
            size="sm" 
            class="flex items-center gap-2 transition"
            :class="toggleEstadoLogic.class"
            @click="changeEstado"
            :disabled="isUpdatingState"
          >
            <span v-if="isUpdatingState" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            <component v-else :is="toggleEstadoLogic.icon" class="h-4 w-4" />
            {{ toggleEstadoLogic.label }}
          </Button>
        </div>

        <Button 
          variant="not_allowed" 
          size="sm" 
          class="flex items-center gap-2 text-danger border-danger hover:bg-danger hover:text-white transition-colors"
          @click="showDeleteModal = true"
        >
          <Trash2 class="h-4 w-4" />
          Eliminar Permanentemente
        </Button>
      </div>

      <CardContent class="space-y-5 pt-5" :class="{ 'opacity-90': !isEditable }">
        
        <transition name="slide">
          <div v-if="errorMessage" class="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3 shadow-sm">
            <AlertCircle class="h-4 w-4 text-danger shrink-0 mt-0.5 " />
            <div class="flex-1 min-w-0">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-danger">Error</h4>
              <p class="text-xs font-medium whitespace-pre-wrap text-danger">{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = null" class="text-danger/60 hover:text-danger-hover transition-colors shrink-0">
              <X class="h-3 w-3 text-danger" />
            </button>
          </div>
        </transition>

        <div class="relative rounded-xl border border-gray-200 bg-gray-100 p-1 max-w-sm mx-auto opacity-70 cursor-not-allowed">
          <div
            class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg shadow-sm transition-all duration-300 ease-out"
            :class="form.tipo === 'PREPARACION' ? 'translate-x-0 bg-secondary' : 'translate-x-full bg-accent'"
          />
          <div class="relative grid grid-cols-2 gap-1 pointer-events-none">
            <div class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold" :class="form.tipo === 'PREPARACION' ? 'text-white' : 'text-text-muted'">
              <BookOpen class="h-4 w-4" /> Preparación
            </div>
            <div class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold" :class="form.tipo === 'PRUEBA' ? 'text-white' : 'text-text-muted'">
              <Trophy class="h-4 w-4" /> Prueba
            </div>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Nombre de la Fase <span class="text-error">*</span></label>
          <input
            v-model="form.nombre"
            :disabled="!isEditable"
            class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Modalidad <span class="text-error">*</span></label>
            <select
              v-model="form.modalidad"
              :disabled="!isEditable"
              class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="SEMIPRESENCIAL">Semipresencial</option>
            </select>
          </div>

          <template v-if="form.tipo === 'PRUEBA'">
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Criterio aprobación (%) <span class="text-error">*</span></label>
              <input
                v-model.number="form.criterioAprobacion"
                type="number"
                min="0"
                max="100"
                :disabled="!isEditable"
                class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Fase anterior</label>
              <select
                v-model="form.faseAnteriorId"
                :disabled="!isEditable"
                class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Ninguna / Primera Prueba</option>
                <option v-for="fase in fasesPruebaDisponibles" :key="fase.id_fase" :value="fase.id_fase">
                  {{ fase.nombre_fase }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Lugar realización</label>
              <input
                v-model="form.lugarRealizacion"
                :disabled="!isEditable"
                class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div class="col-span-1 md:col-span-2 pt-2">
              <button 
                type="button" 
                class="flex items-center gap-3 focus:outline-none group"
                @click="togglePruebaFinal"
                :class="{ 'opacity-70 cursor-not-allowed': !isEditable || isOriginalPruebaFinal }"
                :disabled="!isEditable || isOriginalPruebaFinal"
              >
                <div 
                  class="flex items-center justify-center h-5 w-5 rounded border shadow-sm transition-colors"
                  :class="form.es_prueba_final ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-primary/50'"
                >
                  <CheckSquare v-if="form.es_prueba_final" class="h-4 w-4" />
                  <Square v-else class="h-4 w-4" />
                </div>
                <span class="text-sm font-bold text-text-main select-none transition-colors group-hover:text-primary">
                  Es Fase Prueba Final
                </span>
              </button>

              <transition name="slide">
                <div v-if="form.es_prueba_final" class="mt-3 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3 shadow-sm">
                  <AlertCircle class="h-5 w-5 text-orange-500 shrink-0" />
                  <div>
                    <p class="text-[13px] font-medium text-orange-800 leading-snug">
                      <strong>Aviso Importante:</strong> No se puede cambiar el tipo de fase prueba final luego de ser guardada. Además, <strong>no se podrán agregar más fases de prueba</strong> para esta categoría.
                    </p>
                  </div>
                </div>
              </transition>
            </div>
          </template>
        </div>

        <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col justify-center items-center" :class="{ 'pointer-events-none opacity-70': !isEditable }">
          <div v-if="form.tipo === 'PREPARACION'" class="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <div class="flex flex-col items-center">
              <label class="mb-2 block text-sm font-semibold text-text-main text-center w-full">Inicio de Preparación <span class="text-error">*</span></label>
              <VDatePicker ref="inicioCalendarRef" v-model="form.fecha_inicio" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minGlobalDate" />
            </div>
            <div class="flex flex-col items-center">
              <label class="mb-2 block text-sm font-semibold text-text-main text-center w-full">Fin de Preparación <span class="text-error">*</span></label>
              <VDatePicker ref="finCalendarRef" v-model="form.fecha_fin" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minFechaFin" />
            </div>
          </div>
          <div v-else class="flex flex-col items-center">
            <label class="mb-2 block text-sm font-semibold text-text-main text-center w-full">Fecha y Hora de la Prueba <span class="text-error">*</span></label>
            <VDatePicker ref="realizacionCalendarRef" v-model="form.fecha_realizacion" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minGlobalDate" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
          <textarea
            v-model="form.descripcion"
            :disabled="!isEditable"
            class="min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <transition name="slide">
          <div v-if="isEditable" class="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" @click="isEditable = false" :disabled="isSubmitting">Cancelar Edición</Button>
            <Button variant="accent" @click="handleSave" :disabled="!isFormValid || isSubmitting">
              <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              Guardar Cambios
            </Button>
          </div>
        </transition>

      </CardContent>
    </Card>

    <div v-if="showDeleteModal" class="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card class="w-full max-w-sm border-gray-200 bg-white shadow-2xl animate-fade-in text-center overflow-hidden">
        <div class="bg-danger-soft py-6 flex justify-center">
          <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Trash2 class="h-8 w-8 text-danger" />
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-text-main mb-2">¿Eliminar Permanentemente?</h3>
          <p class="text-sm text-text-muted mb-6 leading-relaxed">
            Esta acción es <strong class="text-text-main">irreversible</strong>. Se eliminará la fase por completo y se perderá toda la configuración.
          </p>
          <div class="flex items-center gap-3">
            <Button variant="outline" class="flex-1" @click="showDeleteModal = false" :disabled="isDeletingFase">Cancelar</Button>
            <Button variant="accent" class="flex-1 bg-danger hover:bg-danger-hover text-white border-transparent" @click="confirmDelete" :disabled="isDeletingFase">
              <span v-if="isDeletingFase" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              Eliminar
            </Button>
          </div>
        </div>
      </Card>
    </div>

  </div>
</template>

<style scoped>
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