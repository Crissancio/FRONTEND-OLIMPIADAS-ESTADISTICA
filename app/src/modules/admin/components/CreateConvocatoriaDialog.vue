<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Hash } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { useConvocatorias } from '@/modules/admin/composables/useConvocatorias'
import type { ConvocatoriaCreateDTO } from '@/modules/convocatorias/types/convocatorias.api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const { createConvocatoria } = useConvocatorias()

const isLoading = ref(false)
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
    if (open) return
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
  },
)

const montoValue = computed(() => {
  const raw = typeof form.value.montoInscripcion === 'number'
    ? String(form.value.montoInscripcion)
    : String(form.value.montoInscripcion || '').trim()
  if (!raw) return null

  const num = Number(raw)
  if (!Number.isFinite(num)) return null
  if (num < 0) return null
  return num
})

const close = () => emit('update:open', false)

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

const toDateInputValue = (date: Date | null): string | null => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toDateTimeInputValue = (date: Date | null): string | null => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const today = startOfDay(new Date())
const minInicioOlimpiada = computed(() => today)
const minFinOlimpiada = computed(() => form.value.inicioOlimpiada ? startOfDay(form.value.inicioOlimpiada) : undefined)
const minInscripcion = computed(() => form.value.inicioOlimpiada ? startOfDay(form.value.inicioOlimpiada) : undefined)
const maxInscripcion = computed(() => form.value.finOlimpiada ? endOfDay(form.value.finOlimpiada) : undefined)
const minFinInscripcion = computed(() => form.value.inicioInscripcion ?? minInscripcion.value)

watch(
  () => form.value.inicioOlimpiada,
  (inicio) => {
    if (!inicio) {
      form.value.finOlimpiada = null
      form.value.inicioInscripcion = null
      form.value.finInscripcion = null
      return
    }
    if (form.value.finOlimpiada && startOfDay(form.value.finOlimpiada) < startOfDay(inicio)) form.value.finOlimpiada = null
  },
)

watch(
  () => form.value.finOlimpiada,
  (fin) => {
    if (!fin) {
      form.value.inicioInscripcion = null
      form.value.finInscripcion = null
      return
    }
    const max = endOfDay(fin)
    if (form.value.inicioInscripcion && form.value.inicioInscripcion > max) form.value.inicioInscripcion = null
    if (form.value.finInscripcion && form.value.finInscripcion > max) form.value.finInscripcion = null
  },
)

watch(
  () => form.value.inicioInscripcion,
  (inicio) => {
    if (!inicio) {
      form.value.finInscripcion = null
      return
    }
    if (form.value.finInscripcion && form.value.finInscripcion < inicio) form.value.finInscripcion = null
  },
)

const handleSubmit = async () => {
  if (!form.value.nombre.trim()) return
  if (!form.value.gestion.trim()) return

  isLoading.value = true
  try {
    const payload: ConvocatoriaCreateDTO = {
      nombre_convocatoria: form.value.nombre.trim(),
      gestion: Number(form.value.gestion),
      descripcion: form.value.descripcion.trim() ? form.value.descripcion.trim() : null,
      inicio_olimpiadas: toDateInputValue(form.value.inicioOlimpiada),
      fin_olimpiadas: toDateInputValue(form.value.finOlimpiada),
      fecha_inicio_inscripcion: toDateTimeInputValue(form.value.inicioInscripcion),
      fecha_fin_inscripcion: toDateTimeInputValue(form.value.finInscripcion),
      monto_inscripcion: montoValue.value
    }

    const created = await createConvocatoria(payload)
    close()
    router.push(`/admin/convocatoria/${created.id}/gestionar?nuevaConvocatoria=true`)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:items-center sm:px-4 sm:py-8">
    <Card class="ope-calendar-theme my-auto max-h-none w-full max-w-7xl overflow-visible border-gray-200 bg-white sm:max-h-[92vh] sm:overflow-y-auto">
      <CardContent class="p-0">
        <div class="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <FileText class="h-5 w-5" />
            </div>
            <div>
              <h2 class="font-heading text-xl font-bold text-text-main">Crear Nueva Convocatoria</h2>
              <p class="text-sm text-text-muted">Se creara con estado borrador.</p>
            </div>
          </div>
        </div>

        <form class="space-y-5 p-4 sm:p-6" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <section class="space-y-4 rounded-xl border border-gray-200 border-l-4 border-l-accent bg-white p-3 sm:p-4">
              <div>
                <h3 class="font-heading text-base font-bold text-text-main">Datos generales</h3>
                <p class="mt-1 text-sm text-text-muted">Información ingresada por teclado.</p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-text-main">Nombre de la Olimpiada</label>
                <input v-model="form.nombre" required class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Ej: XXI Olimpiada de Estadistica" />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-text-main"><Hash class="mr-1 inline h-3.5 w-3.5" />Gestion</label>
                <input v-model="form.gestion" required type="number" min="2020" max="2100" class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-text-main">Monto de inscripción (Bs)</label>
                <input
                  v-model="form.montoInscripcion"
                  type="number"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
                  placeholder="Ej: 20"
                />
                <p class="mt-1 text-xs text-text-muted">Opcional. Deja vacío si no aplica.</p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-text-main">Descripcion</label>
                <textarea v-model="form.descripcion" required class="min-h-[12rem] w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"></textarea>
              </div>
            </section>

            <section class="space-y-4 rounded-xl border border-gray-200 border-l-4 border-l-accent bg-white p-3 sm:p-4">
              <div>
                <h3 class="font-heading text-base font-bold text-text-main">Fechas de la convocatoria</h3>
                <p class="mt-1 text-sm text-text-muted">Selecciona fechas directamente en los calendarios.</p>
              </div>

              <div class="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3">
                  <label class="mb-2 block text-sm font-semibold text-text-main">Inicio Olimpiada</label>
                  <VDatePicker v-model="form.inicioOlimpiada" mode="date" locale="es" :first-day-of-week="2" :min-date="minInicioOlimpiada" expanded />
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!form.inicioOlimpiada ? 'opacity-60' : ''">
                  <label class="mb-2 block text-sm font-semibold text-text-main">Fin Olimpiada</label>
                  <VDatePicker v-model="form.finOlimpiada" mode="date" locale="es" :first-day-of-week="2" :min-date="minFinOlimpiada" expanded :disabled="!form.inicioOlimpiada" />
                  <p v-if="!form.inicioOlimpiada" class="mt-2 text-xs font-medium text-text-muted">Selecciona primero el inicio de olimpiada.</p>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!form.inicioOlimpiada || !form.finOlimpiada ? 'opacity-60' : ''">
                  <label class="mb-2 block text-sm font-semibold text-text-main">Inicio Inscripcion</label>
                  <VDatePicker v-model="form.inicioInscripcion" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minInscripcion" :max-date="maxInscripcion" expanded :disabled="!form.inicioOlimpiada || !form.finOlimpiada" />
                  <p v-if="!form.inicioOlimpiada || !form.finOlimpiada" class="mt-2 text-xs font-medium text-text-muted">Define primero el periodo de olimpiada.</p>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!form.inicioInscripcion ? 'opacity-60' : ''">
                  <label class="mb-2 block text-sm font-semibold text-text-main">Fin Inscripcion</label>
                  <VDatePicker v-model="form.finInscripcion" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minFinInscripcion" :max-date="maxInscripcion" expanded :disabled="!form.inicioInscripcion" />
                  <p v-if="!form.inicioInscripcion" class="mt-2 text-xs font-medium text-text-muted">Selecciona primero el inicio de inscripcion.</p>
                </div>
              </div>
            </section>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" @click="close">Cancelar</Button>
            <Button type="submit" variant="accent" :disabled="isLoading">{{ isLoading ? 'Creando...' : 'Crear Convocatoria' }}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
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
  --vc-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-focus-ring: 0 0 0 2px rgba(17, 50, 100, 0.28);
  --vc-header-arrow-color: #113264;
  --vc-header-arrow-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-header-title-color: #1E293B;
  --vc-weekday-color: #113264;
  --vc-nav-item-active-bg: #113264;
  --vc-nav-item-current-color: #113264;
  --vc-time-month-color: #113264;
  --vc-time-day-color: #113264;
  --vc-time-select-group-icon-color: #113264;
  --vc-select-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-day-content-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-day-content-disabled-color: rgba(17, 50, 100, 0.38);
}

.ope-calendar-theme :deep(.vc-container) {
  width: 100%;
  border-color: rgba(17, 50, 100, 0.16);
  border-radius: 0.75rem;
  font-family: var(--font-sans);
}

.ope-calendar-theme :deep(.vc-highlight-light) {
  background-color: rgba(17, 50, 100, 0.16);
}

.ope-calendar-theme :deep(.vc-highlight-outline) {
  border-color: rgba(17, 50, 100, 0.55);
}

.ope-calendar-theme :deep(.vc-highlight-solid) {
  background-color: #113264;
}

.ope-calendar-theme :deep(.vc-day-content.vc-disabled) {
  background-color: rgba(17, 50, 100, 0.06);
  color: rgba(17, 50, 100, 0.42);
}

.ope-calendar-theme :deep(.vc-time-picker) {
  border-color: rgba(17, 50, 100, 0.16);
}

@media (max-width: 640px) {
  .ope-calendar-theme :deep(.vc-container) {
    --vc-text-sm: 13px;
    --vc-text-base: 14px;
  }

  .ope-calendar-theme :deep(.vc-weeks) {
    padding: 4px;
  }
}
</style>
