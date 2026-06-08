<script setup lang="ts">
import { computed } from 'vue'
import { Mail, Phone, Building2, Eye, UserCog, Check } from 'lucide-vue-next'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { EstudianteItem } from '@/modules/inscripcion/components/EstudianteDetalleModal.vue'

const props = defineProps<{
  student: EstudianteItem
  modoSeleccion: 'campania' | 'exportar' | null
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'ver', student: EstudianteItem): void
  (e: 'admin', student: EstudianteItem): void
}>()

const studentStatusClass = computed(() => {
  const status = props.student.estado
  if (status === 'APROBADO') return 'border-success/20 bg-success/10 text-success'
  if (status === 'RECHAZADO') return 'border-error/20 bg-error/10 text-error'
  if (status === 'PENDIENTE') return 'border-warning/20 bg-warning/10 text-warning'
  return 'border-gray-300 bg-gray-100 text-gray-600'
})

const studentStatusLabel = computed(() => {
  const status = props.student.estado
  return status === 'SIN_ESTADO' ? 'Registrado' : status.charAt(0) + status.slice(1).toLowerCase()
})

const cardClasses = computed(() => {
  if (props.modoSeleccion) {
    if (props.isSelected) {
      return 'border-success bg-success/5 ring-1 ring-success cursor-pointer'
    }
    return 'border-gray-200 bg-gray-100 opacity-60 grayscale cursor-pointer hover:opacity-80'
  }
  return 'border-gray-200 bg-white hover:border-gray-300'
})
</script>

<template>
  <div
    class="rounded-xl border p-4 shadow-sm transition-all"
    :class="cardClasses"
    @click="modoSeleccion ? emit('toggle', Number(student.id)) : undefined"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div class="relative">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-sm">
            {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
          </div>
          
          <div
            v-if="modoSeleccion"
            class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white transition-colors"
            :class="isSelected ? 'bg-success' : 'bg-gray-300'"
          >
            <Check v-if="isSelected" class="h-3 w-3 text-white" stroke-width="3" />
          </div>
        </div>
        
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <p class="font-bold text-text-main text-sm leading-tight">{{ student.nombres }} {{ student.apellidos }}</p>
            <Badge variant="not_allowed" class="text-[10px] px-1.5 py-0 font-bold uppercase tracking-wide" :class="studentStatusClass">
              {{ studentStatusLabel }}
            </Badge>
          </div>
          <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted font-medium">
            <span class="inline-flex items-center gap-1">
              <Mail class="h-3 w-3" />{{ student.email }}
            </span>
            <span class="inline-flex items-center gap-1">
              <Phone class="h-3 w-3" />{{ student.telefono }}
            </span>
            <span class="inline-flex items-center gap-1">
              <Building2 class="h-3 w-3" />{{ student.colegio }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!modoSeleccion" class="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        <Button
          variant="outline"
          class="flex items-center gap-1 text-xs px-3 h-8 border-gray-300 text-gray-700 hover:bg-gray-100"
          @click.stop="emit('ver', student)"
        >
          <Eye class="h-3.5 w-3.5" />Ver
        </Button>
        <Button
          class="flex items-center gap-1 bg-primary text-white hover:bg-primary-dark text-xs px-3 h-8"
          @click.stop="emit('admin', student)"
        >
          <UserCog class="h-3.5 w-3.5" />Admin
        </Button>
      </div>
    </div>
  </div>
</template>