<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { BookOpen, Trophy, AlertCircle, X, CheckSquare, Square } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

import { fasesService } from '@/modules/fases/services/fases.service'
import type { 
  FaseUnionDTO, 
  TipoFase, 
  ModalidadFase,
  FasePreparacionCreateDTO,
  FasePruebaCreateDTO
} from '@/modules/fases/types/fases.api'

const props = defineProps<{
  categoriaId: number
  fases: FaseUnionDTO[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const isOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const minGlobalDate = ref(new Date(Date.now() + 10 * 60000)) // +10 minutos

// REFERENCIAS A LOS CALENDARIOS PARA FORZAR EL MOVIMIENTO DEL MES
const inicioCalendarRef = ref<any>(null)
const finCalendarRef = ref<any>(null)
const realizacionCalendarRef = ref<any>(null)

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

// VIGILAMOS LA FECHA DE INICIO PARA ACTUALIZAR LA FECHA FIN Y SU CALENDARIO
watch(() => form.value.fecha_inicio, async (newInicio) => {
  if (form.value.tipo === 'PREPARACION' && newInicio) {
    if (!form.value.fecha_fin || form.value.fecha_fin <= newInicio) {
      // Sumamos 1 hora por defecto a la fecha fin para mantenerla válida
      form.value.fecha_fin = new Date(newInicio.getTime() + 60 * 60000) 
      
      // Esperamos a que vue actualice el DOM y forzamos al calendario a ir al mes correcto
      await nextTick()
      if (finCalendarRef.value) {
        finCalendarRef.value.move(form.value.fecha_fin)
      }
    }
  }
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

const initializeDates = () => {
  const now = new Date()
  minGlobalDate.value = new Date(now.getTime() + 10 * 60000)
  
  const defaultStart = new Date(now.getTime() + 15 * 60000) 
  const defaultEnd = new Date(now.getTime() + 75 * 60000)
  
  return { defaultStart, defaultEnd }
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

const openCreate = () => {
  const { defaultStart, defaultEnd } = initializeDates()
  
  errorMessage.value = null
  form.value = {
    tipo: 'PREPARACION',
    nombre: '',
    descripcion: '',
    modalidad: 'VIRTUAL',
    fecha_inicio: defaultStart,
    fecha_fin: defaultEnd,
    fecha_realizacion: defaultStart,
    criterioAprobacion: 51,
    lugarRealizacion: '',
    faseAnteriorId: '',
    es_prueba_final: false
  }
  isOpen.value = true
  forceCalendarsToCurrentDates()
}

const close = () => {
  isOpen.value = false
  errorMessage.value = null
}

const fasesPruebaDisponibles = computed(() => {
  return props.fases.filter(f => f.tipo_fase === 'PRUEBA')
})

const minFechaFin = computed(() => {
  return form.value.fecha_inicio 
    ? new Date(form.value.fecha_inicio.getTime() + 5 * 60000) // Mínimo 5 min después del inicio
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

const handleSave = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  errorMessage.value = null

  try {
    if (form.value.tipo === 'PREPARACION') {
      const payload: FasePreparacionCreateDTO = {
        id_categoria_fk: props.categoriaId,
        nombre_fase: form.value.nombre,
        descripcion: form.value.descripcion,
        modalidad: form.value.modalidad,
        fecha_inicio: form.value.fecha_inicio.toISOString(),
        fecha_fin: form.value.fecha_fin.toISOString()
      }
      await fasesService.crearFasePreparacion(payload)
    } else {
      const payload: FasePruebaCreateDTO = {
        id_categoria_fk: props.categoriaId,
        nombre_fase: form.value.nombre,
        descripcion: form.value.descripcion,
        modalidad: form.value.modalidad,
        criterio_aprobacion: form.value.criterioAprobacion,
        fecha_realizacion: form.value.fecha_realizacion.toISOString(),
        lugar_realizacion: form.value.lugarRealizacion,
        id_fase_anterior: form.value.faseAnteriorId ? Number(form.value.faseAnteriorId) : null,
        es_prueba_final: form.value.es_prueba_final
      }
      await fasesService.crearFasePrueba(payload)
    }

    emit('refresh')
    close()
  } catch (error) {
    extractError(error, 'No se pudo crear la fase. Verifica los datos ingresados.')
  } finally {
    isSubmitting.value = false
  }
}

const togglePruebaFinal = () => {
  form.value.es_prueba_final = !form.value.es_prueba_final
}

defineExpose({ openCreate, close })
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
  >
    <Card class="w-full max-w-3xl border-gray-200 bg-white shadow-xl animate-fade-in my-auto">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <span>Crear Nueva Fase</span>
          <button @click="close" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-5 pt-4">
        <div class="relative rounded-xl border border-gray-200 bg-gray-50 p-1 max-w-sm mx-auto">
          <div
            class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg shadow-sm transition-all duration-300 ease-out"
            :class="form.tipo === 'PREPARACION' ? 'translate-x-0 bg-secondary' : 'translate-x-full bg-accent'"
          />
          <div class="relative grid grid-cols-2 gap-1">
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors duration-300"
              :class="form.tipo === 'PREPARACION' ? 'text-white' : 'text-text-muted hover:text-primary'"
              @click="form.tipo = 'PREPARACION'"
            >
              <BookOpen class="h-4 w-4" />
              Preparación
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors duration-300"
              :class="form.tipo === 'PRUEBA' ? 'text-primary' : 'text-text-muted hover:text-primary'"
              @click="form.tipo = 'PRUEBA'"
            >
              <Trophy class="h-4 w-4" />
              Prueba
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Nombre de la Fase <span class="text-error">*</span></label>
          <input
            v-model="form.nombre"
            placeholder="Ej: Clasificatorias Nacionales"
            class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Modalidad <span class="text-error">*</span></label>
            <select
              v-model="form.modalidad"
              class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
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
                class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              />
            </div>
            
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Fase anterior</label>
              <select
                v-model="form.faseAnteriorId"
                class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
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
                class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
                placeholder="Ej: Coliseo Central / Zoom"
              />
            </div>

            <div class="col-span-1 md:col-span-2 pt-2">
              <button 
                type="button" 
                class="flex items-center gap-3 focus:outline-none group"
                @click="togglePruebaFinal"
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

        <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col justify-center items-center">
          <div v-if="form.tipo === 'PREPARACION'" class="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <div class="flex flex-col items-center">
              <label class="mb-2 block text-sm font-semibold text-text-main text-center w-full">Inicio de Preparación <span class="text-error">*</span></label>
              <VDatePicker
                ref="inicioCalendarRef"
                v-model="form.fecha_inicio"
                mode="dateTime"
                is24hr
                locale="es"
                :first-day-of-week="2"
                :min-date="minGlobalDate"
              />
            </div>
            <div class="flex flex-col items-center">
              <label class="mb-2 block text-sm font-semibold text-text-main text-center w-full">Fin de Preparación <span class="text-error">*</span></label>
              <VDatePicker
                ref="finCalendarRef"
                v-model="form.fecha_fin"
                mode="dateTime"
                is24hr
                locale="es"
                :first-day-of-week="2"
                :min-date="minFechaFin"
              />
            </div>
          </div>
          
          <div v-else class="flex flex-col items-center">
            <label class="mb-2 block text-sm font-semibold text-text-main text-center w-full">Fecha y Hora de la Prueba <span class="text-error">*</span></label>
            <VDatePicker
              ref="realizacionCalendarRef"
              v-model="form.fecha_realizacion"
              mode="dateTime"
              is24hr
              locale="es"
              :first-day-of-week="2"
              :min-date="minGlobalDate"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
          <textarea
            v-model="form.descripcion"
            placeholder="Instrucciones, temarios o detalles adicionales..."
            class="min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>
        
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

        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" @click="close" :disabled="isSubmitting">Cancelar</Button>
          <Button variant="accent" @click="handleSave" :disabled="!isFormValid || isSubmitting">
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            Crear Fase
          </Button>
        </div>

      </CardContent>
    </Card>
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