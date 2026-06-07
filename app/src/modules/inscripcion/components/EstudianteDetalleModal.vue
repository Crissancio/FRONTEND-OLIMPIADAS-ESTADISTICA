<script setup lang="ts">
import { BookOpen, Building2, Mail, Phone } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { EstadoInscripcion } from '@/modules/inscripcion/types/inscripcion.api'

export interface EstudianteItem {
  id: string
  nombres: string
  apellidos: string
  carnet: string
  email: string
  telefono: string
  colegio: string
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

const studentStatusLabel = (status: EstudianteItem['estado']) => {
  if (status === 'SIN_ESTADO') return 'REGISTRADO'
  return status
}
</script>

<template>
  <div
    v-if="open && student"
    class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4"
  >
    <Card class="w-full max-w-2xl border-gray-200">
      <CardHeader>
        <CardTitle>Información del Estudiante</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3 border-b border-gray-200 pb-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-dark text-sm font-bold text-white"
          >
            {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
          </div>
          <div>
            <p class="font-bold text-text-main">{{ student.nombres }} {{ student.apellidos }}</p>
            <p class="text-sm text-text-muted mt-0.5">CI: {{ student.carnet }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 mt-4">
          <p class="text-sm text-text-main flex items-center">
            <Mail class="mr-2 h-4 w-4 text-text-muted" />{{ student.email }}
          </p>
          <p class="text-sm text-text-main flex items-center">
            <Phone class="mr-2 h-4 w-4 text-text-muted" />{{ student.telefono }}
          </p>
          <p class="text-sm text-text-main flex items-center">
            <Building2 class="mr-2 h-4 w-4 text-text-muted" />{{ student.colegio }}
          </p>
          <p class="text-sm text-text-main flex items-center">
            <BookOpen class="mr-2 h-4 w-4 text-text-muted" />{{ student.curso }} {{ student.nivel }}
          </p>
          <p class="text-sm text-text-main">Nacimiento: {{ student.fechaNacimiento }}</p>
          <p class="text-sm text-text-main">RUDE: {{ student.rude }}</p>
          <p class="text-sm text-text-main">Inscripción: {{ student.fechaInscripcion }}</p>
          <p class="text-sm text-text-main">Estado: {{ studentStatusLabel(student.estado) }}</p>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <Button variant="outline" @click="emit('close')">Cerrar</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>