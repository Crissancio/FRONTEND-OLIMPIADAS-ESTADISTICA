<script setup lang="ts">
import { BookOpen, Building2, Mail, Phone, CreditCard, Calendar, Hash, X } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { EstadoInscripcion } from '@/modules/inscripcion/types/inscripcion.api'

export interface EstudianteItem {
  id: string
  idEstudiante?: number
  nombres: string
  apellidos: string
  carnet: string
  email: string
  telefono: string
  colegio: string
  idColegio?: number
  curso: string
  nivel: string
  estado: EstadoInscripcion | 'SIN_ESTADO'
  fechaInscripcion: string
  fechaNacimiento: string
  rude: string
}

const props = defineProps<{
  open: boolean
  student: EstudianteItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const formatDate = (raw: string) => {
  if (!raw || raw === 'Sin fecha') return raw
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
}

const nivelLabel = (curso: string, nivel: string) => {
  if (!curso || !nivel) return 'Sin datos'
  return `${curso}° ${nivel === 'PRIMARIA' ? 'Primaria' : 'Secundaria'}`
}

const estadoClass = (estado: EstudianteItem['estado']) => {
  if (estado === 'APROBADO') return 'border-success/20 bg-success/10 text-success'
  if (estado === 'RECHAZADO') return 'border-error/20 bg-error/10 text-error'
  if (estado === 'PENDIENTE') return 'border-warning/20 bg-warning/10 text-warning'
  return 'border-gray-200 bg-gray-100 text-text-muted'
}

const estadoLabel = (estado: EstudianteItem['estado']) =>
  estado === 'SIN_ESTADO' ? 'Registrado' : estado.charAt(0) + estado.slice(1).toLowerCase()
</script>

<template>
  <div
    v-if="open && student"
    class="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4"
  >
    <Card class="w-full max-w-lg border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base">Detalle del Estudiante</CardTitle>
          <Button variant="ghost" size="sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent class="space-y-5 p-5">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary-dark text-lg font-bold text-white shadow-sm">
            {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
          </div>
          <div class="min-w-0">
            <p class="font-heading text-lg font-bold text-text-main leading-tight">
              {{ student.nombres }} {{ student.apellidos }}
            </p>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" :class="estadoClass(student.estado)">
                {{ estadoLabel(student.estado) }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-muted">Identificación</p>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="flex items-center gap-2 text-sm">
                <CreditCard class="h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p class="text-xs text-text-muted">Carnet</p>
                  <p class="font-mono font-semibold text-text-main">{{ student.carnet }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Hash class="h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p class="text-xs text-text-muted">RUDE</p>
                  <p class="font-mono font-semibold text-text-main">{{ student.rude }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Calendar class="h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p class="text-xs text-text-muted">Nacimiento</p>
                  <p class="font-semibold text-text-main">{{ formatDate(student.fechaNacimiento) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <BookOpen class="h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p class="text-xs text-text-muted">Curso</p>
                  <p class="font-semibold text-text-main">{{ nivelLabel(student.curso, student.nivel) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-muted">Contacto</p>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="flex items-center gap-2 text-sm">
                <Mail class="h-4 w-4 shrink-0 text-text-muted" />
                <div class="min-w-0">
                  <p class="text-xs text-text-muted">Correo</p>
                  <p class="truncate font-semibold text-text-main">{{ student.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Phone class="h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p class="text-xs text-text-muted">Teléfono</p>
                  <p class="font-semibold text-text-main">{{ student.telefono }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm sm:col-span-2">
                <Building2 class="h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p class="text-xs text-text-muted">Colegio</p>
                  <p class="font-semibold text-text-main">{{ student.colegio }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-muted">Inscripción</p>
            <div class="flex items-center gap-2 text-sm">
              <Calendar class="h-4 w-4 shrink-0 text-text-muted" />
              <div>
                <p class="text-xs text-text-muted">Fecha de inscripción</p>
                <p class="font-semibold text-text-main">{{ formatDate(student.fechaInscripcion) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button variant="outline" @click="emit('close')">Cerrar</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>