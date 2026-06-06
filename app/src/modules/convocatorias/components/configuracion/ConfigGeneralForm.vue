<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Edit, Save, X, Settings, Calendar as CalendarIcon, AlertCircle } from 'lucide-vue-next'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/style.css'

import { convocatoriasService } from '@/modules/convocatorias/services/convocatorias.service'
import type { ConvocatoriaDTO, ConvocatoriaUpdateDTO } from '@/modules/convocatorias/types/convocatorias.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{ convocatoria: ConvocatoriaDTO }>()
const emit = defineEmits(['refresh'])

const isEditingData = ref(false)
const isLoading = ref(false)
const localError = ref('')

// Almacenamos el formulario local
const form = ref({
  nombre: props.convocatoria.nombre_convocatoria,
  gestion: props.convocatoria.gestion,
  montoInscripcion: props.convocatoria.monto_inscripcion || '',
  descripcion: props.convocatoria.descripcion || '',
  inicioOlimpiada: props.convocatoria.inicio_olimpiadas,
  finOlimpiada: props.convocatoria.fin_olimpiadas,
  inicioInscripcion: props.convocatoria.fecha_inicio_inscripcion,
  finInscripcion: props.convocatoria.fecha_fin_inscripcion,
})

// === SINCRONIZACIÓN REACTIVA (Soluciona el problema de refresco) ===
// Si el padre detecta un cambio y actualiza la prop, reflejamos los datos si no estamos editando
watch(() => props.convocatoria, (newVal) => {
  if (!isEditingData.value) {
    form.value = {
      nombre: newVal.nombre_convocatoria,
      gestion: newVal.gestion,
      montoInscripcion: newVal.monto_inscripcion || '',
      descripcion: newVal.descripcion || '',
      inicioOlimpiada: newVal.inicio_olimpiadas,
      finOlimpiada: newVal.fin_olimpiadas,
      inicioInscripcion: newVal.fecha_inicio_inscripcion,
      finInscripcion: newVal.fecha_fin_inscripcion,
    }
  }
}, { deep: true, immediate: true })

// === REGLAS DE NEGOCIO (Estados Temporales) ===
const estadoTemp = computed(() => props.convocatoria.estado_temporal)

const isCompletelyDisabled = computed(() => {
  return ['OCULTA', 'CANCELADA', 'FINALIZADA'].includes(estadoTemp.value)
})

const canEditInicioOlimpiada = computed(() => {
  if (['INSCRIPCIONES PROXIMAS', 'INSCRIPCION EN CURSO', 'EN CURSO'].includes(estadoTemp.value)) return false
  return true
})

const canEditInicioInscripcion = computed(() => {
  if (['INSCRIPCION EN CURSO', 'EN CURSO'].includes(estadoTemp.value)) return false
  return true
})


// === UTILIDADES DE FECHAS (Soporte UTC/Z) ===
const startOfDay = (date: Date) => { const next = new Date(date); next.setHours(0, 0, 0, 0); return next }
const endOfDay = (date: Date) => { const next = new Date(date); next.setHours(23, 59, 59, 999); return next }

const safeParseDate = (val: string | null | undefined) => {
  if (!val) return null
  const date = new Date(val)
  return Number.isNaN(date.getTime()) ? null : date
}

const hasDateChanged = (val1: string | null | undefined, val2: string | null | undefined) => {
  if (!val1 && !val2) return false
  if (!val1 || !val2) return true
  return new Date(val1).getTime() !== new Date(val2).getTime()
}

// === LÓGICA DE DEPENDENCIAS EN FECHAS ===
const minEditInicioOlimpiada = computed(() => startOfDay(new Date()))

const editInicioOlimpiadaDate = computed({
  get: () => safeParseDate(form.value.inicioOlimpiada),
  set: (date: Date | null) => {
    form.value.inicioOlimpiada = date ? date.toISOString() : null
    if (!date) { form.value.finOlimpiada = null; form.value.inicioInscripcion = null; form.value.finInscripcion = null; return }
    const fin = safeParseDate(form.value.finOlimpiada)
    if (fin && startOfDay(fin) < startOfDay(date)) form.value.finOlimpiada = null
  }
})
const editFinOlimpiadaDate = computed({
  get: () => safeParseDate(form.value.finOlimpiada),
  set: (date: Date | null) => {
    form.value.finOlimpiada = date ? date.toISOString() : null
    if (!date) { form.value.inicioInscripcion = null; form.value.finInscripcion = null; return }
    const max = endOfDay(date)
    const inicioInscripcion = safeParseDate(form.value.inicioInscripcion)
    const finInscripcion = safeParseDate(form.value.finInscripcion)
    if (inicioInscripcion && inicioInscripcion > max) form.value.inicioInscripcion = null
    if (finInscripcion && finInscripcion > max) form.value.finInscripcion = null
  }
})
const editInicioInscripcionDate = computed({
  get: () => safeParseDate(form.value.inicioInscripcion),
  set: (date: Date | null) => {
    form.value.inicioInscripcion = date ? date.toISOString() : null
    if (!date) { form.value.finInscripcion = null; return }
    const fin = safeParseDate(form.value.finInscripcion)
    if (fin && fin < date) form.value.finInscripcion = null
  }
})
const editFinInscripcionDate = computed({
  get: () => safeParseDate(form.value.finInscripcion),
  set: (date: Date | null) => { 
    form.value.finInscripcion = date ? date.toISOString() : null 
  }
})

const minEditFinOlimpiada = computed(() => editInicioOlimpiadaDate.value ? startOfDay(editInicioOlimpiadaDate.value) : undefined)
const minEditInscripcion = computed(() => editInicioOlimpiadaDate.value ? startOfDay(editInicioOlimpiadaDate.value) : undefined)
const maxEditInscripcion = computed(() => editFinOlimpiadaDate.value ? endOfDay(editFinOlimpiadaDate.value) : undefined)
const minEditFinInscripcion = computed(() => editInicioInscripcionDate.value ?? minEditInscripcion.value)

function cancelDataEdit() {
  form.value = {
    nombre: props.convocatoria.nombre_convocatoria,
    gestion: props.convocatoria.gestion,
    montoInscripcion: props.convocatoria.monto_inscripcion || '',
    descripcion: props.convocatoria.descripcion || '',
    inicioOlimpiada: props.convocatoria.inicio_olimpiadas,
    finOlimpiada: props.convocatoria.fin_olimpiadas,
    inicioInscripcion: props.convocatoria.fecha_inicio_inscripcion,
    finInscripcion: props.convocatoria.fecha_fin_inscripcion,
  }
  isEditingData.value = false
  localError.value = ''
}

// === GUARDAR (Enviando SOLO lo modificado) ===
async function saveData() {
  localError.value = ''
  
  const montoRaw = typeof form.value.montoInscripcion === 'number' ? String(form.value.montoInscripcion) : String(form.value.montoInscripcion || '').trim()
  const montoParsed = montoRaw ? Number(montoRaw) : NaN
  const finalMonto = Number.isFinite(montoParsed) && montoParsed >= 0 ? montoParsed : null

  const payload: Partial<ConvocatoriaUpdateDTO> = {}
  let hasChanges = false

  if (form.value.nombre !== props.convocatoria.nombre_convocatoria) {
    payload.nombre_convocatoria = form.value.nombre
    hasChanges = true
  }
  if (Number(form.value.gestion) !== props.convocatoria.gestion) {
    payload.gestion = Number(form.value.gestion)
    hasChanges = true
  }
  if (finalMonto !== props.convocatoria.monto_inscripcion) {
    payload.monto_inscripcion = finalMonto
    hasChanges = true
  }
  if (form.value.descripcion !== (props.convocatoria.descripcion || '')) {
    payload.descripcion = form.value.descripcion
    hasChanges = true
  }
  if (hasDateChanged(form.value.inicioOlimpiada, props.convocatoria.inicio_olimpiadas)) {
    payload.inicio_olimpiadas = form.value.inicioOlimpiada
    hasChanges = true
  }
  if (hasDateChanged(form.value.finOlimpiada, props.convocatoria.fin_olimpiadas)) {
    payload.fin_olimpiadas = form.value.finOlimpiada
    hasChanges = true
  }
  if (hasDateChanged(form.value.inicioInscripcion, props.convocatoria.fecha_inicio_inscripcion)) {
    payload.fecha_inicio_inscripcion = form.value.inicioInscripcion
    hasChanges = true
  }
  if (hasDateChanged(form.value.finInscripcion, props.convocatoria.fecha_fin_inscripcion)) {
    payload.fecha_fin_inscripcion = form.value.finInscripcion
    hasChanges = true
  }

  if (!hasChanges) {
    isEditingData.value = false
    return
  }

  isLoading.value = true

  try {
    await convocatoriasService.actualizarConvocatoria(props.convocatoria.id_convocatoria, payload)
    isEditingData.value = false
    emit('refresh')
  } catch (err: any) {
    const responseData = err.response?.data
    if (responseData) {
      localError.value = responseData.error 
        || responseData.message 
        || (Array.isArray(responseData.detail) ? 'Por favor, revise que todos los campos tengan un formato válido.' : responseData.detail) 
        || 'Ha ocurrido un error inesperado al actualizar.'
    } else {
      localError.value = 'Problema de conexión con el servidor. Intente nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card class="border-gray-200 bg-white shadow-soft relative overflow-visible">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <Settings class="h-5 w-5 text-primary" /> Configuración General
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">
            {{ isEditingData ? 'Modifica los campos y haz clic en Guardar cambios.' : 'Haz clic en Editar para habilitar los campos y el calendario.' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          
          <template v-if="isCompletelyDisabled">
            <Badge variant="outline" class="bg-gray-100 text-gray-500 border-gray-200 py-1.5 px-3">
              Edición bloqueada ({{ estadoTemp }})
            </Badge>
          </template>

          <template v-else-if="!isEditingData">
            <Button variant="outline" class="flex items-center gap-2" @click="isEditingData = true">
              <Edit class="h-4 w-4" /> Habilitar Edición
            </Button>
          </template>

          <template v-else>
            <Button variant="outline" class="flex items-center gap-2" @click="cancelDataEdit" :disabled="isLoading">
              <X class="h-4 w-4" /> Cancelar
            </Button>
            <Button variant="accent" class="flex items-center gap-2" @click="saveData" :disabled="isLoading">
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <Save v-else class="h-4 w-4" /> 
              {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
            </Button>
          </template>

        </div>
      </div>
    </CardHeader>

    <CardContent class="pt-6">
      
      <transition name="fade-slide">
        <div v-if="localError" class="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-4 shadow-sm">
          <AlertCircle class="h-5 w-5 text-error shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="text-xs font-bold text-error uppercase tracking-wider">No se pudieron guardar los cambios</h4>
            <p class="text-sm text-error/90 mt-1 font-medium">{{ localError }}</p>
          </div>
          <button @click="localError = ''" class="text-error/60 hover:text-error transition-colors">
            <X class="h-4 w-4" />
          </button>
        </div>
      </transition>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div>
            <h3 class="font-heading text-base font-bold text-text-main">Datos generales</h3>
            <p class="mt-1 text-sm text-text-muted">Información básica de la convocatoria.</p>
          </div>
          
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Nombre</label>
            <input v-model="form.nombre" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Gestión</label>
              <input v-model.number="form.gestion" type="number" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Inscripción (Bs)</label>
              <input v-model.number="form.montoInscripcion" type="number" step="0.01" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500" />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
            <textarea v-model="form.descripcion" rows="4" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"></textarea>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 ope-calendar-theme">
          <div>
            <h3 class="font-heading text-base font-bold text-text-main">Fechas de la convocatoria</h3>
            <p class="mt-1 text-sm text-text-muted">Ajusta los periodos mediante el calendario.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-opacity" :class="(!isEditingData || !canEditInicioOlimpiada) ? 'opacity-60 pointer-events-none' : ''">
              <label class="mb-2 flex items-center text-sm font-semibold text-text-main">
                Inicio Olimpiada
                <span v-if="!canEditInicioOlimpiada && isEditingData" class="text-[10px] text-warning ml-2 font-bold">(Bloqueado)</span>
              </label>
              <VDatePicker v-model="editInicioOlimpiadaDate" mode="date" locale="es" :first-day-of-week="2" :min-date="minEditInicioOlimpiada">
                <template #default="{ inputValue, inputEvents }">
                  <div class="relative w-full cursor-pointer group">
                    <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    <input :value="inputValue" v-on="inputEvents" class="w-full cursor-pointer rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white transition-all disabled:bg-gray-50 disabled:text-gray-500" readonly :disabled="!isEditingData || !canEditInicioOlimpiada" placeholder="Seleccionar..." />
                  </div>
                </template>
              </VDatePicker>
            </div>
            
            <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-opacity" :class="!isEditingData || !editInicioOlimpiadaDate ? 'opacity-60 pointer-events-none' : ''">
              <label class="mb-2 block text-sm font-semibold text-text-main">Fin Olimpiada</label>
              <VDatePicker v-model="editFinOlimpiadaDate" mode="date" locale="es" :first-day-of-week="2" :min-date="minEditFinOlimpiada">
                <template #default="{ inputValue, inputEvents }">
                  <div class="relative w-full cursor-pointer group">
                    <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    <input :value="inputValue" v-on="inputEvents" class="w-full cursor-pointer rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white transition-all disabled:bg-gray-50 disabled:text-gray-500" readonly :disabled="!isEditingData || !editInicioOlimpiadaDate" placeholder="Seleccionar..." />
                  </div>
                </template>
              </VDatePicker>
            </div>
            
            <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-opacity" :class="(!isEditingData || !canEditInicioInscripcion || !editFinOlimpiadaDate) ? 'opacity-60 pointer-events-none' : ''">
              <label class="mb-2 flex items-center text-sm font-semibold text-text-main">
                Inicio Inscripción
                <span v-if="!canEditInicioInscripcion && isEditingData" class="text-[10px] text-warning ml-2 font-bold">(Bloqueado)</span>
              </label>
              <VDatePicker v-model="editInicioInscripcionDate" mode="dateTime" is24hr hide-time-header locale="es" :first-day-of-week="2" :min-date="minEditInscripcion" :max-date="maxEditInscripcion">
                <template #default="{ inputValue, inputEvents }">
                  <div class="relative w-full cursor-pointer group">
                    <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    <input :value="inputValue" v-on="inputEvents" class="w-full cursor-pointer rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white transition-all disabled:bg-gray-50 disabled:text-gray-500" readonly :disabled="!isEditingData || !canEditInicioInscripcion || !editFinOlimpiadaDate" placeholder="Seleccionar..." />
                  </div>
                </template>
              </VDatePicker>
            </div>
            
            <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-opacity" :class="!isEditingData || !editInicioInscripcionDate ? 'opacity-60 pointer-events-none' : ''">
              <label class="mb-2 block text-sm font-semibold text-text-main">Fin Inscripción</label>
              <VDatePicker v-model="editFinInscripcionDate" mode="dateTime" is24hr hide-time-header locale="es" :first-day-of-week="2" :min-date="minEditFinInscripcion" :max-date="maxEditInscripcion">
                <template #default="{ inputValue, inputEvents }">
                  <div class="relative w-full cursor-pointer group">
                    <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    <input :value="inputValue" v-on="inputEvents" class="w-full cursor-pointer rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white transition-all disabled:bg-gray-50 disabled:text-gray-500" readonly :disabled="!isEditingData || !editInicioInscripcionDate" placeholder="Seleccionar..." />
                  </div>
                </template>
              </VDatePicker>
            </div>
          </div>
        </section>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
/* Animaciones para el globo de error */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Modificación Nativa de VCalendar con tus Variables Tailwind */
.ope-calendar-theme :deep(.vc-container) { 
  --vc-font-family: var(--font-sans); 
  --vc-rounded-full: 0.5rem;
  border: 1px solid #e5e7eb; 

  /* Tonalidades base adaptadas al Accent */
  --vc-accent-50: var(--color-accent);
  --vc-accent-100: var(--color-accent);
  --vc-accent-200: var(--color-accent); 
  --vc-accent-300: var(--color-accent);
  --vc-accent-400: var(--color-accent);
  --vc-accent-500: var(--color-accent);
  --vc-accent-600: var(--color-accent); 
  
  /* Tonalidades de alto contraste para selección */
  --vc-accent-700: var(--color-primary-dark);
  --vc-accent-800: var(--color-primary-dark);
  --vc-accent-900: var(--color-primary-dark); 
}
</style>