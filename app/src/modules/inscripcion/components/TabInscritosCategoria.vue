<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Users, Search, Mail, Phone, Building2, Eye } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import EstudianteDetalleModal from '@/modules/inscripcion/components/EstudianteDetalleModal.vue'
import type { EstudianteItem } from '@/modules/inscripcion/components/EstudianteDetalleModal.vue'
import { inscripcionesService } from '@/modules/inscripcion/services/inscripcion.service'
import { estudiantesService } from '@/modules/estudiantes/services/estudiantes.service'
import type { EstadoInscripcion } from '@/modules/inscripcion/types/inscripcion.api'

const props = defineProps<{
  categoriaId: number
}>()

const emit = defineEmits<{
  (e: 'error', msg: string): void
}>()

const estudiantes = ref<EstudianteItem[]>([])
const isLoadingEstudiantes = ref(false)
const estudiantesError = ref('')
const statusFilter = ref<'TODOS' | EstadoInscripcion | 'SIN_ESTADO'>('TODOS')
const searchStudent = ref('')
const selectedStudent = ref<EstudianteItem | null>(null)
const isStudentModalOpen = ref(false)

const loadEstudiantes = async () => {
  if (!Number.isFinite(props.categoriaId)) return
  isLoadingEstudiantes.value = true
  estudiantesError.value = ''
  try {
    const res = await inscripcionesService.listarInscripciones({
      page: 1,
      limit: 200,
      id_categoria: props.categoriaId,
    })
    const inscripciones = res.data.items
    const estudianteIds = inscripciones
      .map((i) => i.id_estudiante)
      .filter((id, idx, arr) => arr.indexOf(id) === idx)

    const estudiantesRes = await Promise.all(
      estudianteIds.map((id) => estudiantesService.obtenerEstudiantePorId(id).catch(() => null)),
    )

    estudiantes.value = inscripciones.map((insc) => {
      const est = estudiantesRes.find((r) => r?.data.id_estudiante === insc.id_estudiante)?.data
      return {
        id: String(insc.id_inscripcion),
        nombres: est?.nombres ?? '',
        apellidos: [est?.paterno, est?.materno].filter(Boolean).join(' '),
        carnet: est?.carnet_identidad ?? '',
        email: est?.correo ?? 'Sin correo',
        telefono: est?.telefono ? String(est.telefono) : 'Sin teléfono',
        colegio: est?.colegio?.nombre ?? `Colegio ${est?.id_colegio ?? ''}`,
        curso: String(est?.curso ?? ''),
        nivel: est?.nivel ?? '',
        estado: (insc.estado ?? 'SIN_ESTADO') as EstadoInscripcion | 'SIN_ESTADO',
        fechaInscripcion: insc.fecha_inscripcion ?? 'Sin fecha',
        fechaNacimiento: est?.fecha_nacimiento ?? '',
        rude: est?.rude ?? 'Sin RUDE',
      }
    })
  } catch {
    estudiantes.value = []
    estudiantesError.value = 'No se pudieron cargar los estudiantes.'
    emit('error', estudiantesError.value)
  } finally {
    isLoadingEstudiantes.value = false
  }
}

watch(() => props.categoriaId, loadEstudiantes, { immediate: true })

const filteredStudents = computed(() => {
  const term = searchStudent.value.trim().toLowerCase()
  return estudiantes.value.filter((item) => {
    const byStatus = statusFilter.value === 'TODOS' || item.estado === statusFilter.value
    if (!term) return byStatus
    return (
      byStatus &&
      (item.nombres.toLowerCase().includes(term) ||
        item.apellidos.toLowerCase().includes(term) ||
        item.carnet.includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.colegio.toLowerCase().includes(term))
    )
  })
})

const openStudentModal = (student: EstudianteItem) => {
  selectedStudent.value = student
  isStudentModalOpen.value = true
}

const studentStatusClass = (status: EstudianteItem['estado']) => {
  if (status === 'APROBADO') return 'border-success/20 bg-success/10 text-success'
  if (status === 'RECHAZADO') return 'border-error/20 bg-error/10 text-error'
  if (status === 'PENDIENTE') return 'border-warning/20 bg-warning/10 text-warning'
  return 'border-gray-200 bg-gray-100 text-text-muted'
}

const studentStatusLabel = (status: EstudianteItem['estado']) =>
  status === 'SIN_ESTADO' ? 'REGISTRADO' : status
</script>

<template>
  <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
    <CardHeader class="border-b border-gray-200">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <CardTitle class="flex items-center gap-2">
          <Users class="h-5 w-5 text-primary" />Estudiantes Inscritos
        </CardTitle>
        <Badge variant="outline" class="w-fit border-info/20 bg-info/10 px-3 py-1 text-info">
          {{ filteredStudents.length }} estudiantes
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="p-6">
      <div class="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div class="relative max-w-md">
          <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
          <input
            v-model="searchStudent"
            class="h-11 w-full rounded-md border border-gray-300 px-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            placeholder="Buscar por nombre, carnet, email o colegio..."
          />
        </div>
        <select
          v-model="statusFilter"
          class="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
          <option value="RECHAZADO">Rechazado</option>
          <option value="SIN_ESTADO">Registrado</option>
        </select>
      </div>

      <div class="space-y-3">
        <div v-if="isLoadingEstudiantes" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">
          Cargando estudiantes...
        </div>
        <div v-else-if="estudiantesError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
          {{ estudiantesError }}
        </div>
        <div v-else-if="filteredStudents.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-text-muted">
          Sin estudiantes para esta categoría.
        </div>

        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-dark text-sm font-bold text-white">
                {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-bold text-text-main">{{ student.nombres }} {{ student.apellidos }}</p>
                  <Badge variant="outline" :class="studentStatusClass(student.estado)">
                    {{ studentStatusLabel(student.estado) }}
                  </Badge>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                  <span class="inline-flex items-center gap-1">
                    <Mail class="h-3.5 w-3.5 text-text-muted" />{{ student.email }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <Phone class="h-3.5 w-3.5 text-text-muted" />{{ student.telefono }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <Building2 class="h-3.5 w-3.5 text-text-muted" />{{ student.colegio }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" class="flex items-center gap-1.5" @click="openStudentModal(student)">
                <Eye class="h-4 w-4" />Ver
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <EstudianteDetalleModal
    :open="isStudentModalOpen"
    :student="selectedStudent"
    @close="isStudentModalOpen = false"
  />
</template>