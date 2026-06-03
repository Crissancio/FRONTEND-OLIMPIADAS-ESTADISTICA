<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Info, CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Hash } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

import { convocatoriasService } from '../services/convocatorias.service'
import { useConvocatoriasStore } from '../stores/convocatorias.store'
import type { ConvocatoriaCreateDTO } from '../types/convocatorias.api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const convocatoriasStore = useConvocatoriasStore()

const currentStep = ref(1)
const totalSteps = 3
const isSubmitting = ref(false)

const windowWidth = ref(window.innerWidth)
const updateWidth = () => windowWidth.value = window.innerWidth

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
  document.body.style.overflow = '' // Limpieza por seguridad al desmontar
})

const calendarColumns = computed(() => windowWidth.value >= 1024 ? 2 : 1)

const form = ref({
  nombre: '',
  gestion: String(new Date().getFullYear()),
  descripcion: '',
  montoInscripcion: '' as string | number,
  inicioOlimpiada: null as Date | null,
  finOlimpiada: null as Date | null,
  inicioInscripcion: null as Date | null,
  finInscripcion: null as Date | null,
})

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    
    if (open) {
      currentStep.value = 1
    } else {
      form.value = {
        nombre: '',
        gestion: String(new Date().getFullYear()),
        descripcion: '',
        montoInscripcion: '',
        inicioOlimpiada: null,
        finOlimpiada: null,
        inicioInscripcion: null,
        finInscripcion: null,
      }
    }
  }
)

const close = () => emit('update:open', false)

const isStep1Valid = computed(() => form.value.nombre.trim() !== '' && String(form.value.gestion).trim() !== '' && form.value.descripcion.trim() !== '')
const isStep2Valid = computed(() => form.value.inicioOlimpiada !== null && form.value.finOlimpiada !== null)
const isStep3Valid = computed(() => form.value.inicioInscripcion !== null && form.value.finInscripcion !== null)

const canSave = computed(() => isStep1Valid.value && isStep2Valid.value && isStep3Valid.value)

const handleNombreInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.value.nombre = target.value.toUpperCase()
}

const today = new Date()
const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

const minInicioOlimpiada = computed(() => startOfToday)
const minFinOlimpiada = computed(() => form.value.inicioOlimpiada ? form.value.inicioOlimpiada : startOfToday)

const minInscripcion = computed(() => form.value.inicioOlimpiada ? form.value.inicioOlimpiada : startOfToday)
const maxInscripcion = computed(() => form.value.finOlimpiada ? new Date(form.value.finOlimpiada.setHours(23, 59, 59)) : undefined)
const minFinInscripcion = computed(() => form.value.inicioInscripcion ?? minInscripcion.value)

const timeRules = ref({
  hours: (hour: number, ctx: { date?: Date }) => {
    if (!ctx || !ctx.date) return true
    
    if (ctx.date.toDateString() === today.toDateString()) {
      return hour >= today.getHours()
    }
    return true
  },
  minutes: (minute: number, ctx: { date?: Date, hours?: number }) => {
    if (!ctx || !ctx.date || ctx.hours === undefined) return true
    
    if (ctx.date.toDateString() === today.toDateString() && ctx.hours === today.getHours()) {
      return minute >= today.getMinutes()
    }
    return true
  }
})

watch(() => form.value.inicioOlimpiada, (val) => {
  if (!val || (form.value.finOlimpiada && form.value.finOlimpiada < val)) form.value.finOlimpiada = null
  form.value.inicioInscripcion = null
  form.value.finInscripcion = null
})
watch(() => form.value.finOlimpiada, (val) => {
  if (form.value.inicioInscripcion && val && form.value.inicioInscripcion > val) form.value.inicioInscripcion = null
  if (form.value.finInscripcion && val && form.value.finInscripcion > val) form.value.finInscripcion = null
})
watch(() => form.value.inicioInscripcion, (val) => {
  if (!val || (form.value.finInscripcion && form.value.finInscripcion < val)) form.value.finInscripcion = null
})

const toDateTimeInputValue = (date: Date | null): string | undefined => {
  if (!date) return undefined
  return date.toISOString() 
}

const toDateInputValue = (date: Date | null): string | undefined => {
  if (!date) return undefined
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().split('T')[0]
}
const montoValue = computed(() => {
  const raw = String(form.value.montoInscripcion || '').trim()
  if (!raw) return null
  const num = Number(raw)
  return Number.isFinite(num) && num >= 0 ? num : null
})

const handleSubmit = async () => {
  if (!canSave.value) return
  isSubmitting.value = true

  try {
    const payload: ConvocatoriaCreateDTO = {
      nombre_convocatoria: form.value.nombre.trim(),
      gestion: Number(form.value.gestion),
      descripcion: form.value.descripcion.trim() || undefined,
      inicio_olimpiadas: toDateInputValue(form.value.inicioOlimpiada),
      fin_olimpiadas: toDateInputValue(form.value.finOlimpiada),
      fecha_inicio_inscripcion: toDateTimeInputValue(form.value.inicioInscripcion),
      fecha_fin_inscripcion: toDateTimeInputValue(form.value.finInscripcion),
      monto_inscripcion: montoValue.value ?? undefined 
    }

    console.log('Payload enviado al backend:', JSON.parse(JSON.stringify(payload)))

    const created = await convocatoriasService.crearConvocatoria(payload)
    await convocatoriasStore.fetchConvocatorias({ page: 1 }, false)
    
    close()
    router.push(`/admin/convocatoria/${created.data.id_convocatoria}/gestionar?nuevaConvocatoria=true`)
  } catch (error) {
    console.error('Error al crear la convocatoria:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
    <Card class="ope-calendar-theme relative flex flex-col w-full max-w-4xl max-h-[95vh] sm:max-h-[85vh] bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
      
      <div class="shrink-0 border-b border-gray-100 bg-white p-6 pb-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="font-heading text-2xl font-bold text-primary-dark">Crear Convocatoria</h2>
            <p class="text-sm text-text-muted mt-1">Completa los datos en 3 pasos.</p>
          </div>
        </div>

        <div class="relative flex items-center justify-between w-full max-w-lg mx-auto">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full"></div>
          <div 
            class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-dark rounded-full transition-all duration-300"
            :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
          ></div>
          
          <button 
            v-for="step in totalSteps" 
            :key="step"
            @click="step <= currentStep || (step === 2 && isStep1Valid) || (step === 3 && isStep2Valid) ? currentStep = step : null"
            class="relative z-10 flex flex-col items-center gap-2 group focus:outline-none"
            :class="{ 'cursor-default': step > currentStep && !((step === 2 && isStep1Valid) || (step === 3 && isStep2Valid)) }"
          >
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2"
              :class="[
                currentStep === step 
                  ? 'bg-primary-dark border-primary-dark text-white shadow-lg ring-4 ring-primary-dark/20' 
                  : step < currentStep 
                    ? 'bg-primary-dark border-primary-dark text-white' 
                    : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-300'
              ]"
            >
              <Info v-if="step === 1" class="w-5 h-5" />
              <CalendarDays v-else-if="step === 2" class="w-5 h-5" />
              <CalendarPlus v-else class="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>

      <CardContent class="grow p-0 overflow-y-auto overflow-x-hidden bg-gray-50/30">
        <div class="relative w-full h-full p-6">
          <transition name="slide" mode="out-in">
            <div v-if="currentStep === 1" :key="1" class="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 class="text-lg font-bold text-text-main flex items-center gap-2"><Info class="w-5 h-5 text-primary" /> Datos Generales</h3>
                <p class="text-sm text-text-muted mt-1">Identificación principal de la convocatoria.</p>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-text-main">Nombre de la Olimpiada</label>
                  <input :value="form.nombre" @input="handleNombreInput" required class="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark transition-all" placeholder="Ej: XXI OLIMPIADA DE ESTADÍSTICA" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-text-main"> Gestión</label>
                    <input v-model="form.gestion" required type="number" min="2020" class="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark transition-all" onwheel="event.preventDefault()"/>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-text-main">Costo Inscripción (Bs)</label>
                    <input v-model="form.montoInscripcion" type="number" min="0" step="0.01" class="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark transition-all" placeholder="0 (opcional)" onwheel="event.preventDefault()"/>
                  </div>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-text-main">Descripción</label>
                  <textarea v-model="form.descripcion" required class="w-full min-h-120px rounded-xl border border-gray-200 bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark transition-all resize-none" placeholder="Breve descripción de la convocatoria..."></textarea>
                </div>
              </div>
            </div>

            <div v-else-if="currentStep === 2" :key="2" class="space-y-6 w-full max-w-3xl mx-auto">
              <div>
                <h3 class="text-lg font-bold text-text-main flex items-center gap-2"><CalendarDays class="w-5 h-5 text-primary" /> Periodo de la Olimpiada</h3>
                <p class="text-sm text-text-muted mt-1">Define cuándo inician y terminan las olimpiadas. No se permiten fechas pasadas.</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label class="block mb-3 text-sm font-semibold text-text-main">Fecha de Inicio</label>
                  <VDatePicker v-model="form.inicioOlimpiada" mode="date" locale="es" :first-day-of-week="2" :min-date="minInicioOlimpiada" expanded :columns="calendarColumns" />
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm" :class="{'opacity-50 pointer-events-none': !form.inicioOlimpiada}">
                  <label class="mb-3 text-sm font-semibold text-text-main flex justify-between items-center">
                    Fecha de Finalización
                    <span v-if="!form.inicioOlimpiada" class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Requiere inicio</span>
                  </label>
                  <VDatePicker v-model="form.finOlimpiada" mode="date" locale="es" :first-day-of-week="2" :min-date="minFinOlimpiada" expanded :columns="calendarColumns" />
                </div>
              </div>
            </div>

            <div v-else-if="currentStep === 3" :key="3" class="space-y-6 w-full max-w-3xl mx-auto">
              <div>
                <h3 class="text-lg font-bold text-text-main flex items-center gap-2"><CalendarPlus class="w-5 h-5 text-primary" /> Periodo de Inscripción</h3>
                <p class="text-sm text-text-muted mt-1">Las inscripciones deben estar dentro del periodo de las olimpiadas (y horas válidas).</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label class="block mb-3 text-sm font-semibold text-text-main">Apertura de Inscripciones</label>
                  <VDatePicker v-model="form.inicioInscripcion" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minInscripcion" :max-date="maxInscripcion" :rules="timeRules" expanded :columns="calendarColumns" />
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm" :class="{'opacity-50 pointer-events-none': !form.inicioInscripcion}">
                  <label class="mb-3 text-sm font-semibold text-text-main flex justify-between items-center">
                    Cierre de Inscripciones
                    <span v-if="!form.inicioInscripcion" class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Requiere apertura</span>
                  </label>
                  <VDatePicker v-model="form.finInscripcion" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minFinInscripcion" :max-date="maxInscripcion" :rules="timeRules" expanded :columns="calendarColumns" />
                </div>
              </div>
            </div>
          </transition>
        </div>
      </CardContent>

      <div class="shrink-0 p-4 sm:p-6 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        
        <button 
          @click="close" 
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-text-main border border-gray-300 bg-white hover:bg-red-500 hover:text-white hover:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
        >
          Cancelar
        </button>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            v-if="currentStep > 1" 
            @click="currentStep--" 
            variant="outline" 
            class="flex-1 sm:flex-none border-gray-300"
          >
            <ChevronLeft class="w-4 h-4 mr-1" /> Atrás
          </Button>

          <Button 
            v-if="currentStep < totalSteps" 
            @click="currentStep++" 
            variant="primary" 
            :disabled="currentStep === 1 ? !isStep1Valid : !isStep2Valid"
            class="flex-1 sm:flex-none bg-white hover:bg-primary hover:text-white"
          >
            Siguiente <ChevronRight class="w-4 h-4 ml-1" />
          </Button>

          <button 
            v-if="currentStep === totalSteps"
            @click="handleSubmit"
            :disabled="!canSave || isSubmitting"
            class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-medium text-white bg-accent-dark hover:bg-accent disabled:opacity-50 disabled:pointer-events-none focus:ring-4 focus:ring-accent/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSubmitting ? 'Guardando...' : 'Guardar Convocatoria' }}
          </button>
        </div>
      </div>

    </Card>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.ope-calendar-theme {
  --vc-accent-50: #f3f6fb;
  --vc-accent-100: #dfe8f4;
  --vc-accent-200: #c2d1e7;
  --vc-accent-300: #99b2d5;
  --vc-accent-400: #6689bd;
  --vc-accent-500: #315a94;
  --vc-accent-600: #113264;
  --vc-accent-700: #0f2b56;
  --vc-accent-800: #0c2448;
  --vc-accent-900: #0A1E3C;
}

.ope-calendar-theme :deep(.vc-container) {
  width: 100%;
  border-color: rgba(17, 50, 100, 0.16);
  border-radius: 0.75rem;
  font-family: var(--font-sans);
}

.ope-calendar-theme :deep(.vc-highlight-solid) {
  background-color: var(--color-primary-dark);
}

.ope-calendar-theme :deep(.vc-time-select-group) {
  max-height: 140px;
}

.ope-calendar-theme :deep(.vc-time-select-group .vc-base-select select) {
  height: auto !important;
  max-height: 120px !important;
  overflow-y: auto !important;
  padding: 4px;
}

.ope-calendar-theme :deep(.vc-select-list) {
  max-height: 110px !important;
  overflow-y: auto !important;
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary-dark) transparent;
}

.ope-calendar-theme :deep(.vc-select-list::-webkit-scrollbar) {
  width: 6px;
}
.ope-calendar-theme :deep(.vc-select-list::-webkit-scrollbar-track) {
  background: transparent;
}
.ope-calendar-theme :deep(.vc-select-list::-webkit-scrollbar-thumb) {
  background-color: var(--color-primary-dark);
  border-radius: 10px;
}
</style>