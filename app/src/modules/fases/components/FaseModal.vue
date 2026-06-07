<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BookOpen, Trophy } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { FaseUnionDTO, ModalidadFase } from '@/modules/fases/types/fases.api'

type FaseTipo = 'preparacion' | 'prueba'
type Modalidad = 'virtual' | 'presencial' | 'semipresencial'

export interface FaseFormData {
  nombre: string
  inicio: string
  fin: string
  descripcion: string
  tipo: FaseTipo
  modalidad: Modalidad
  criterioAprobacion: number
  lugarRealizacion: string
  faseAnteriorId: string
}

export interface FaseListItem {
  id: string
  nombre: string
  tipo: FaseTipo
}

const props = defineProps<{
  open: boolean
  editingFaseId: string | null
  fases: FaseListItem[]
  today: Date
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', form: FaseFormData): void
}>()

const form = ref<FaseFormData>({
  nombre: '',
  inicio: '',
  fin: '',
  descripcion: '',
  tipo: 'preparacion',
  modalidad: 'virtual',
  criterioAprobacion: 51,
  lugarRealizacion: '',
  faseAnteriorId: '',
})

const parseLocalDate = (value: string) => {
  if (!value) return null
  if (value.includes('T')) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const toLocalDateValue = (date: Date | null) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const faseInicioDate = computed({
  get: () => parseLocalDate(form.value.inicio),
  set: (date: Date | null) => {
    form.value.inicio = toLocalDateValue(date)
    const fin = parseLocalDate(form.value.fin)
    if (date && fin && fin < date) form.value.fin = ''
  },
})

const faseFinDate = computed({
  get: () => parseLocalDate(form.value.fin),
  set: (date: Date | null) => {
    form.value.fin = toLocalDateValue(date)
  },
})

const minFaseFinDate = computed(() => faseInicioDate.value ?? undefined)

watch(
  () => form.value.tipo,
  (tipo) => {
    if (tipo === 'prueba') form.value.fin = ''
  },
)

const reset = (data?: Partial<FaseFormData>) => {
  form.value = {
    nombre: data?.nombre ?? '',
    inicio: data?.inicio ?? '',
    fin: data?.fin ?? '',
    descripcion: data?.descripcion ?? '',
    tipo: data?.tipo ?? 'preparacion',
    modalidad: data?.modalidad ?? 'virtual',
    criterioAprobacion: data?.criterioAprobacion ?? 51,
    lugarRealizacion: data?.lugarRealizacion ?? '',
    faseAnteriorId: data?.faseAnteriorId ?? '',
  }
}

defineExpose({ reset })

const handleSave = () => {
  if (!form.value.nombre) return
  if (form.value.tipo === 'preparacion' && (!form.value.inicio || !form.value.fin)) return
  if (form.value.tipo === 'prueba' && (!form.value.inicio || !form.value.criterioAprobacion)) return
  emit('save', { ...form.value })
}

const otherFases = computed(() =>
  props.fases.filter((f) => f.id !== props.editingFaseId),
)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:items-center sm:p-4"
  >
    <Card class="ope-calendar-theme my-auto w-full max-w-4xl border-gray-200 bg-white">
      <CardHeader>
        <CardTitle>{{ editingFaseId ? 'Editar Fase' : 'Crear Nueva Fase' }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="relative rounded-xl border border-gray-200 bg-gray-50 p-1">
          <div
            class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg shadow-sm transition-all duration-300 ease-out"
            :class="form.tipo === 'preparacion' ? 'translate-x-0 bg-secondary' : 'translate-x-full bg-accent'"
          />
          <div class="relative grid grid-cols-2 gap-1">
            <button
              type="button"
              :disabled="Boolean(editingFaseId)"
              class="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-300 disabled:cursor-not-allowed"
              :class="form.tipo === 'preparacion' ? 'text-white' : 'text-text-muted hover:text-primary'"
              @click="form.tipo = 'preparacion'"
            >
              <BookOpen class="h-4 w-4" />
              Preparación
            </button>
            <button
              type="button"
              :disabled="Boolean(editingFaseId)"
              class="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-300 disabled:cursor-not-allowed"
              :class="form.tipo === 'prueba' ? 'text-primary' : 'text-text-muted hover:text-primary'"
              @click="form.tipo = 'prueba'"
            >
              <Trophy class="h-4 w-4" />
              Prueba
            </button>
          </div>
        </div>

        <p v-if="editingFaseId" class="text-xs font-medium text-text-muted">
          El tipo de fase no se puede cambiar al editar.
        </p>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Nombre *</label>
          <input
            v-model="form.nombre"
            class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Modalidad *</label>
            <select
              v-model="form.modalidad"
              class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            >
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
              <option value="semipresencial">Semipresencial</option>
            </select>
          </div>

          <div v-if="form.tipo === 'prueba'">
            <label class="mb-1 block text-sm font-bold text-text-main">Criterio aprobación *</label>
            <input
              v-model.number="form.criterioAprobacion"
              type="number"
              min="0"
              max="100"
              class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            />
          </div>

          <div v-if="form.tipo === 'prueba'">
            <label class="mb-1 block text-sm font-bold text-text-main">Fase anterior</label>
            <select
              v-model="form.faseAnteriorId"
              class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            >
              <option value="">Sin fase anterior</option>
              <option v-for="fase in otherFases" :key="fase.id" :value="fase.id">
                {{ fase.nombre }}
              </option>
            </select>
          </div>

          <div v-if="form.tipo === 'prueba'">
            <label class="mb-1 block text-sm font-bold text-text-main">Lugar realización</label>
            <input
              v-model="form.lugarRealizacion"
              class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              placeholder="Ej: Auditorio UMSA"
            />
          </div>
        </div>

        <div v-if="form.tipo === 'preparacion'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3">
            <label class="mb-2 block text-sm font-semibold text-text-main">Fecha inicio *</label>
            <VDatePicker
              v-model="faseInicioDate"
              mode="dateTime"
              is24hr
              locale="es"
              :first-day-of-week="2"
              :min-date="today"
              expanded
            />
          </div>
          <div
            class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3"
            :class="!faseInicioDate ? 'opacity-60' : ''"
          >
            <label class="mb-2 block text-sm font-semibold text-text-main">Fecha fin *</label>
            <VDatePicker
              v-model="faseFinDate"
              mode="dateTime"
              is24hr
              locale="es"
              :first-day-of-week="2"
              :min-date="minFaseFinDate"
              expanded
              :disabled="!faseInicioDate"
            />
            <p v-if="!faseInicioDate" class="mt-2 text-xs font-medium text-text-muted">
              Selecciona primero la fecha de inicio.
            </p>
          </div>
        </div>

        <div v-else class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3">
          <label class="mb-2 block text-sm font-semibold text-text-main">Fecha realización *</label>
          <VDatePicker
            v-model="faseInicioDate"
            mode="dateTime"
            is24hr
            locale="es"
            :first-day-of-week="2"
            :min-date="today"
            expanded
          />
        </div>

        <div
          v-if="form.tipo === 'preparacion'"
          class="rounded-xl border border-secondary/20 bg-secondary/10 p-3 text-sm font-medium text-secondary"
        >
          Preparación usa rango de fechas: inicio y fin.
        </div>
        <div
          v-else
          class="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm font-medium text-accent-dark"
        >
          Prueba usa fecha única, criterio de aprobación y datos opcionales de realización.
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
          <textarea
            v-model="form.descripcion"
            class="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="emit('close')">Cancelar</Button>
          <Button variant="accent" @click="handleSave">
            {{ editingFaseId ? 'Guardar Cambios' : 'Crear Fase' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>