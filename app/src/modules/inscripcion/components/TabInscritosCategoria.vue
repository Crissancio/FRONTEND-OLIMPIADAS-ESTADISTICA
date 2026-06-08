<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Users, Search, Megaphone, Download, UserPlus, Loader2, CheckSquare, Square,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import EstudianteDetalleModal from '@/modules/inscripcion/components/EstudianteDetalleModal.vue'
import ModalAdministrarInscripcion from '@/modules/inscripcion/components/ModalAdministrarInscripcion.vue'
import ModalCrearInscripcion from '@/modules/inscripcion/components/ModalCrearInscripcion.vue'
import ModalCrearCampania from '@/modules/campanias/components/ModalCrearCampania.vue'
import InscritoCard from '@/modules/inscripcion/components/InscritoCard.vue'
import type { EstudianteItem } from '@/modules/inscripcion/components/EstudianteDetalleModal.vue'
import { inscripcionesService } from '@/modules/inscripcion/services/inscripcion.service'
import { estudiantesService } from '@/modules/estudiantes/services/estudiantes.service'
import type { EstadoInscripcion } from '@/modules/inscripcion/types/inscripcion.api'

const props = defineProps<{
  categoriaId: number
  convocatoriaId: number
  cursoCat: number
  nivelCat: string
}>()

const emit = defineEmits<{
  (e: 'error', msg: string): void
}>()

const estudiantes = ref<EstudianteItem[]>([])
const isLoadingEstudiantes = ref(false)
const estudiantesError = ref('')
const statusFilter = ref<'TODOS' | EstadoInscripcion | 'SIN_ESTADO'>('TODOS')
const searchStudent = ref('')
const selectedIds = ref<number[]>([])

const selectedStudent = ref<EstudianteItem | null>(null)
const isDetalleOpen = ref(false)
const isAdminOpen = ref(false)
const isCrearInscOpen = ref(false)
const isCampaniaOpen = ref(false)

const isExporting = ref(false)
const modoSeleccion = ref<'campania' | 'exportar' | null>(null)

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    emit('error', responseData.error || responseData.message || responseData.detail || fallbackMsg)
    return
  }
  emit('error', err?.message && !err.message.includes('status code') ? err.message : fallbackMsg)
}

const loadEstudiantes = async () => {
  if (!Number.isFinite(props.categoriaId)) return
  isLoadingEstudiantes.value = true
  estudiantesError.value = ''
  try {
    const res = await inscripcionesService.listarInscripciones({
      page: 1, limit: 200, id_categoria: props.categoriaId,
    })
    const inscripciones = res.data.items
    const estudianteIds = inscripciones.map((i) => i.id_estudiante).filter((id, idx, arr) => arr.indexOf(id) === idx)
    const estudiantesRes = await Promise.all(
      estudianteIds.map((id) => estudiantesService.obtenerEstudiantePorId(id).catch(() => null)),
    )
    estudiantes.value = inscripciones.map((insc) => {
      const est = estudiantesRes.find((r) => r?.data.id_estudiante === insc.id_estudiante)?.data
      return {
        id: String(insc.id_inscripcion),
        idEstudiante: est?.id_estudiante,
        nombres: est?.nombres ?? '',
        apellidos: [est?.paterno, est?.materno].filter(Boolean).join(' '),
        carnet: est?.carnet_identidad ?? '',
        email: est?.correo ?? 'Sin correo',
        telefono: est?.telefono ? String(est.telefono) : 'Sin teléfono',
        colegio: est?.colegio?.nombre ?? `Colegio ${est?.id_colegio ?? ''}`,
        idColegio: est?.id_colegio,
        curso: String(est?.curso ?? ''),
        nivel: est?.nivel ?? '',
        estado: (insc.estado ?? 'SIN_ESTADO') as EstadoInscripcion | 'SIN_ESTADO',
        fechaInscripcion: insc.fecha_inscripcion ?? 'Sin fecha',
        fechaNacimiento: est?.fecha_nacimiento ?? '',
        rude: est?.rude ?? 'Sin RUDE',
      }
    })
  } catch (err) {
    estudiantes.value = []
    estudiantesError.value = 'No se pudieron cargar los estudiantes.'
    extractError(err, estudiantesError.value)
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
    return byStatus && (
      item.nombres.toLowerCase().includes(term) ||
      item.apellidos.toLowerCase().includes(term) ||
      item.carnet.includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.colegio.toLowerCase().includes(term)
    )
  })
})

const toggleSelect = (id: number) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

const toggleAll = () => {
  if (selectedIds.value.length === filteredStudents.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredStudents.value.map((s) => Number(s.id))
  }
}

const allSelected = computed(() =>
  filteredStudents.value.length > 0 && selectedIds.value.length === filteredStudents.value.length,
)

// Computada para extraer SOLO los IDs de estudiantes basados en las inscripciones seleccionadas
const destinatariosEstudiantesIds = computed(() => {
  return estudiantes.value
    .filter((s) => selectedIds.value.includes(Number(s.id)))
    .map((s) => s.idEstudiante)
    .filter((id): id is number => id !== undefined)
})

const activarModoSeleccion = (modo: 'campania' | 'exportar') => {
  modoSeleccion.value = modo
  selectedIds.value = []
}

const cancelarSeleccion = () => {
  modoSeleccion.value = null
  selectedIds.value = []
}

const confirmarCampania = () => {
  if (selectedIds.value.length === 0) return
  isCampaniaOpen.value = true
}

const exportar = async (formato: 'csv' | 'pdf') => {
  if (selectedIds.value.length === 0) return
  isExporting.value = true
  try {
    const data = { id_inscripciones: selectedIds.value }
    const res = formato === 'csv'
      ? await inscripcionesService.exportarCsv(data, { responseType: 'blob' })
      : await inscripcionesService.exportarPdf(data, { responseType: 'blob' })
    const blob = new Blob([res as BlobPart], {
      type: formato === 'csv' ? 'text/csv' : 'application/pdf',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inscritos_categoria_${props.categoriaId}.${formato}`
    a.click()
    URL.revokeObjectURL(url)
    cancelarSeleccion()
  } catch (err) {
    extractError(err, `No se pudo exportar el ${formato.toUpperCase()}.`)
  } finally {
    isExporting.value = false
  }
}

const openDetalle = (student: EstudianteItem) => {
  selectedStudent.value = student
  isDetalleOpen.value = true
}

const openAdmin = (student: EstudianteItem) => {
  selectedStudent.value = student
  isAdminOpen.value = true
}

const onUpdated = (updated: EstudianteItem) => {
  const idx = estudiantes.value.findIndex((s) => s.id === updated.id)
  if (idx !== -1) estudiantes.value[idx] = updated
  selectedStudent.value = updated
}

const onDeleted = (id: string) => {
  estudiantes.value = estudiantes.value.filter((s) => s.id !== id)
  isAdminOpen.value = false
  selectedStudent.value = null
}

const onCreated = () => {
  isCrearInscOpen.value = false
  loadEstudiantes()
}
</script>

<template>
  <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
    <CardHeader class="border-b border-gray-200">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <CardTitle class="flex items-center gap-2 text-lg">
          <Users class="h-6 w-6 text-primary" />Estudiantes Inscritos
        </CardTitle>
        <div class="flex flex-wrap items-center gap-3">
          <Badge variant="not_allowed" class="border-primary/30 bg-primary/10 px-3 py-1.5 text-primary font-bold shadow-sm">
            {{ filteredStudents.length }} estudiantes
          </Badge>
          
          <template v-if="!modoSeleccion">
            <Button
              variant="outline"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold border-gray-300 hover:bg-gray-50"
              @click="activarModoSeleccion('campania')"
            >
              <Megaphone class="h-4 w-4" />Campaña
            </Button>
            <Button
              variant="outline"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold border-gray-300 hover:bg-gray-50"
              @click="activarModoSeleccion('exportar')"
            >
              <Download class="h-4 w-4" />Exportar
            </Button>
            <Button
              variant="not_allowed"
              class="flex items-center gap-2 bg-accent text-white hover:bg-accent-dark px-5 py-2 text-sm font-bold shadow-md transition-all"
              @click="isCrearInscOpen = true"
            >
              <UserPlus class="h-4 w-4" />Nueva inscripción
            </Button>
          </template>
          
          <template v-else>
            <p class="text-sm font-bold text-text-muted bg-gray-100 px-3 py-1.5 rounded-lg">
              {{ selectedIds.length }} seleccionados
            </p>
            
            <template v-if="modoSeleccion === 'campania'">
              <Button
                class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark px-5 py-2 text-sm font-bold shadow-md"
                :disabled="selectedIds.length === 0"
                @click="confirmarCampania"
              >
                <Megaphone class="h-4 w-4" />Crear campaña
              </Button>
            </template>
            
            <template v-else>
              <Button
                variant="outline"
                class="flex items-center gap-2 px-5 py-2 text-sm font-bold border-green-600 text-green-700 hover:bg-green-50 shadow-sm"
                :disabled="selectedIds.length === 0 || isExporting"
                @click="exportar('csv')"
              >
                <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
                <span v-else class="font-extrabold uppercase tracking-wide">CSV</span>
              </Button>
              <Button
                variant="outline"
                class="flex items-center gap-2 px-5 py-2 text-sm font-bold border-red-600 text-red-700 hover:bg-red-50 shadow-sm"
                :disabled="selectedIds.length === 0 || isExporting"
                @click="exportar('pdf')"
              >
                <span class="font-extrabold uppercase tracking-wide">PDF</span>
              </Button>
            </template>
            
            <Button variant="ghost" class="text-sm font-semibold text-text-muted hover:bg-gray-100 px-4 py-2" @click="cancelarSeleccion">
              Cancelar
            </Button>
          </template>
        </div>
      </div>

      <div v-if="modoSeleccion" class="mt-4 flex items-center gap-3 rounded-xl border border-info/30 bg-info/10 px-4 py-3 text-sm text-info shadow-sm">
        <button @click="toggleAll" class="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
          <CheckSquare v-if="allSelected" class="h-5 w-5" />
          <Square v-else class="h-5 w-5" />
          {{ allSelected ? 'Deseleccionar todos' : 'Seleccionar todos' }}
        </button>
        <span class="text-info/40">|</span>
        <span class="font-medium">{{ modoSeleccion === 'campania' ? 'Selecciona los destinatarios para enviarles una campaña por correo' : 'Selecciona los inscritos que deseas exportar a un documento' }}</span>
      </div>
    </CardHeader>

    <CardContent class="p-5">
      <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
        <div class="relative">
          <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
          <input
            v-model="searchStudent"
            class="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-4 text-sm font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
            placeholder="Buscar por nombre, carnet, email o colegio..."
          />
        </div>
        <select
          v-model="statusFilter"
          class="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
          <option value="RECHAZADO">Rechazado</option>
          <option value="SIN_ESTADO">Registrado</option>
        </select>
      </div>

      <div v-if="isLoadingEstudiantes" class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-10 text-sm font-medium text-text-muted gap-2">
        <Loader2 class="h-5 w-5 animate-spin text-primary" /> Cargando lista de estudiantes...
      </div>
      
      <div v-else-if="estudiantesError" class="rounded-xl border border-error/20 bg-error/10 p-5 text-sm font-bold text-error shadow-sm text-center">
        {{ estudiantesError }}
      </div>
      
      <div v-else-if="filteredStudents.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-sm font-medium text-text-muted bg-gray-50/50">
        No se encontraron estudiantes para esta categoría o bajo estos filtros de búsqueda.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InscritoCard
          v-for="student in filteredStudents"
          :key="student.id"
          :student="student"
          :modo-seleccion="modoSeleccion"
          :is-selected="selectedIds.includes(Number(student.id))"
          @toggle="toggleSelect"
          @ver="openDetalle"
          @admin="openAdmin"
        />
      </div>
    </CardContent>
  </Card>

  <EstudianteDetalleModal
    :open="isDetalleOpen"
    :student="selectedStudent"
    @close="isDetalleOpen = false"
  />

  <ModalAdministrarInscripcion
    :open="isAdminOpen"
    :student="selectedStudent"
    @close="isAdminOpen = false"
    @updated="onUpdated"
    @deleted="onDeleted"
  />

  <ModalCrearInscripcion
    :open="isCrearInscOpen"
    :convocatoria-id="convocatoriaId"
    :categoria-id="categoriaId"
    :curso-cat="cursoCat"
    :nivel-cat="nivelCat"
    @close="isCrearInscOpen = false"
    @created="onCreated"
    @error="(msg) => emit('error', msg)"
  />

  <ModalCrearCampania
    :open="isCampaniaOpen"
    :destinatarios-ids="destinatariosEstudiantesIds"
    @close="isCampaniaOpen = false"
  />
</template>