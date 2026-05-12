<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Trophy,
  Plus,
  Edit,
  Trash2,
  Upload,
  File,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  XCircle,
  Search,
  BookOpen,
  Settings,
  Save,
  Mail,
  Phone,
  Building2,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'
import CategoriaGestionTabs from '@/modules/admin/components/CategoriaGestionTabs.vue'
import { CategoriasService } from '@/modules/convocatorias/services/categorias.service'
import { EstudiantesService } from '@/modules/convocatorias/services/estudiantes.service'
import { FasesService } from '@/modules/convocatorias/services/fases.service'
import type { CategoriaResponseDTO, NivelEducativo } from '@/modules/convocatorias/types/categorias.api'
import type { EstadoInscripcion, EstudianteResponseDTO } from '@/modules/convocatorias/types/estudiantes.api'
import type { FaseResponseDTO, ModalidadFase } from '@/modules/convocatorias/types/fases.api'

type CategoriaTab = 'fases' | 'estudiantes' | 'resultados' | 'configuracion'

type FaseTipo = 'preparacion' | 'prueba'
type Modalidad = 'virtual' | 'presencial' | 'semipresencial'
type MaterialTipo = 'video' | 'temario' | 'ejercicios' | 'practica' | 'examen' | 'solucionario' | 'otro'

interface MaterialItem {
  id: string
  nombre: string
  tipo: MaterialTipo
}

interface FaseItem {
  id: string
  nombre: string
  inicio: string
  fin: string
  descripcion: string
  tipo: FaseTipo
  modalidad: Modalidad
  criterioAprobacion: number | null
  lugarRealizacion: string
  faseAnteriorId: string
  materiales: MaterialItem[]
}

interface EstudianteItem {
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

const route = useRoute()
const router = useRouter()
const isDesktop = ref(false)
let mediaQuery: MediaQueryList | null = null

const updateDesktop = () => {
  isDesktop.value = Boolean(mediaQuery?.matches)
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  updateDesktop()
  mediaQuery.addEventListener('change', updateDesktop)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', updateDesktop)
})

const convocatoriaId = typeof route.params.convocatoriaId === 'string' ? route.params.convocatoriaId : ''
const categoriaId = typeof route.params.categoriaId === 'string' ? route.params.categoriaId : ''
const numericCategoriaId = computed(() => Number(categoriaId))

const categoria = ref({ nombre: 'Categoria', curso: '', grado: 'SECUNDARIA' })
const isLoadingCategoria = ref(false)
const categoriaError = ref('')

const toCategoriaForm = (item: CategoriaResponseDTO) => ({
  nombre: item.nombre_categoria,
  curso: String(item.curso),
  grado: item.nivel,
})

const activeTab = ref<CategoriaTab>('fases')
const isEditingCategory = ref(false)
const categoriaForm = ref({ ...categoria.value })

const loadCategoria = async () => {
  if (!Number.isFinite(numericCategoriaId.value)) return
  isLoadingCategoria.value = true
  categoriaError.value = ''
  try {
    const res = await CategoriasService.getById(numericCategoriaId.value)
    categoria.value = toCategoriaForm(res.data)
    categoriaForm.value = { ...categoria.value }
  } catch {
    categoriaError.value = 'No se pudo cargar la categoria.'
  } finally {
    isLoadingCategoria.value = false
  }
}

const saveCategoria = async () => {
  await CategoriasService.update(numericCategoriaId.value, {
    nombre_categoria: categoriaForm.value.nombre.trim(),
    curso: Number(categoriaForm.value.curso),
    nivel: categoriaForm.value.grado as NivelEducativo,
  })
  categoria.value = { ...categoriaForm.value }
  isEditingCategory.value = false
}

const cancelCategoriaEdit = () => {
  categoriaForm.value = { ...categoria.value }
  isEditingCategory.value = false
}

const deleteCategoria = async () => {
  await CategoriasService.remove(numericCategoriaId.value)
  router.push(`/admin/convocatoria/${convocatoriaId}/gestionar?tab=categorias`)
}

const goBackToConvocatoria = () => {
  const tab = isDesktop.value ? 'general' : 'categorias'
  router.push(`/admin/convocatoria/${convocatoriaId}/gestionar?tab=${tab}`)
}

const fases = ref<FaseItem[]>([])
const isLoadingFases = ref(false)
const fasesError = ref('')

const toDateInput = (value?: string | null) => value?.slice(0, 19) ?? ''
const toDateTime = (value: string) => {
  if (value.includes('T')) return value.length === 16 ? `${value}:00` : value
  return `${value}T00:00:00`
}
const toModalidad = (value: Modalidad): ModalidadFase => value.toUpperCase() as ModalidadFase
const fromModalidad = (value: string): Modalidad => value.toLowerCase() as Modalidad

const toFaseItem = (item: FaseResponseDTO): FaseItem => {
  const isPrueba = Boolean(item.fecha_realizacion || item.criterio_aprobacion)
  return {
    id: String(item.id_fase),
    nombre: item.nombre_fase,
    inicio: toDateInput(item.fecha_inicio ?? item.fecha_realizacion),
    fin: toDateInput(item.fecha_fin ?? item.fecha_realizacion),
    descripcion: item.descripcion ?? '',
    tipo: isPrueba ? 'prueba' : 'preparacion',
    modalidad: fromModalidad(item.modalidad),
    criterioAprobacion: item.criterio_aprobacion ?? null,
    lugarRealizacion: item.lugar_realizacion ?? '',
    faseAnteriorId: item.id_fase_anterior ? String(item.id_fase_anterior) : '',
    materiales: [],
  }
}

const loadFases = async () => {
  if (!Number.isFinite(numericCategoriaId.value)) return
  isLoadingFases.value = true
  fasesError.value = ''
  try {
    const res = await FasesService.list({ page: 1, limit: 100 })
    fases.value = res.data.items
      .filter((item) => item.id_categoria_fk === numericCategoriaId.value)
      .map(toFaseItem)
  } catch {
    fases.value = []
    fasesError.value = 'No se pudieron cargar las fases.'
  } finally {
    isLoadingFases.value = false
  }
}

watch(
  numericCategoriaId,
  () => {
    loadCategoria()
    loadFases()
  },
  { immediate: true },
)
const expanded = ref<string[]>([])
const toggleExpand = (id: string) => {
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter((item) => item !== id)
    : [...expanded.value, id]
}

const isFaseModalOpen = ref(false)
const editingFaseId = ref<string | null>(null)
const faseForm = ref({
  nombre: '',
  inicio: '',
  fin: '',
  descripcion: '',
  tipo: 'preparacion' as FaseTipo,
  modalidad: 'virtual' as Modalidad,
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

const today = new Date()
today.setHours(0, 0, 0, 0)

const faseInicioDate = computed({
  get: () => parseLocalDate(faseForm.value.inicio),
  set: (date: Date | null) => {
    faseForm.value.inicio = toLocalDateValue(date)
    const fin = parseLocalDate(faseForm.value.fin)
    if (date && fin && fin < date) faseForm.value.fin = ''
  },
})

const faseFinDate = computed({
  get: () => parseLocalDate(faseForm.value.fin),
  set: (date: Date | null) => {
    faseForm.value.fin = toLocalDateValue(date)
  },
})

const minFaseFinDate = computed(() => faseInicioDate.value ?? undefined)

watch(
  () => faseForm.value.tipo,
  (tipo) => {
    if (tipo === 'prueba') faseForm.value.fin = ''
  },
)

const openCreateFase = () => {
  editingFaseId.value = null
  faseForm.value = { nombre: '', inicio: '', fin: '', descripcion: '', tipo: 'preparacion', modalidad: 'virtual', criterioAprobacion: 51, lugarRealizacion: '', faseAnteriorId: '' }
  isFaseModalOpen.value = true
}

const openEditFase = (fase: FaseItem) => {
  editingFaseId.value = fase.id
  faseForm.value = {
    nombre: fase.nombre,
    inicio: fase.inicio,
    fin: fase.fin,
    descripcion: fase.descripcion,
    tipo: fase.tipo,
    modalidad: fase.modalidad,
    criterioAprobacion: fase.criterioAprobacion ?? 51,
    lugarRealizacion: fase.lugarRealizacion,
    faseAnteriorId: fase.faseAnteriorId,
  }
  isFaseModalOpen.value = true
}

const saveFase = async () => {
  if (!faseForm.value.nombre) return
  if (faseForm.value.tipo === 'preparacion' && (!faseForm.value.inicio || !faseForm.value.fin)) return
  if (faseForm.value.tipo === 'prueba' && (!faseForm.value.inicio || !faseForm.value.criterioAprobacion)) return

  if (!editingFaseId.value) {
    const base = {
      id_categoria_fk: numericCategoriaId.value,
      nombre_fase: faseForm.value.nombre.trim(),
      descripcion: faseForm.value.descripcion.trim() || null,
      modalidad: toModalidad(faseForm.value.modalidad),
      estado: 'LISTA' as const,
    }
    const res = faseForm.value.tipo === 'preparacion'
      ? await FasesService.createPreparacion({
          ...base,
          fecha_inicio: toDateTime(faseForm.value.inicio),
          fecha_fin: toDateTime(faseForm.value.fin),
        })
      : await FasesService.createPrueba({
          ...base,
          id_fase_anterior: faseForm.value.faseAnteriorId ? Number(faseForm.value.faseAnteriorId) : null,
          criterio_aprobacion: Number(faseForm.value.criterioAprobacion),
          fecha_realizacion: toDateTime(faseForm.value.inicio),
          lugar_realizacion: faseForm.value.lugarRealizacion.trim() || null,
        })
    fases.value = [toFaseItem(res.data), ...fases.value]
  } else {
    const res = await FasesService.update(Number(editingFaseId.value), {
      nombre_fase: faseForm.value.nombre.trim(),
      descripcion: faseForm.value.descripcion.trim() || null,
      modalidad: toModalidad(faseForm.value.modalidad),
      estado: 'LISTA',
    })
    fases.value = fases.value.map((item) => {
      if (item.id !== editingFaseId.value) return item
      return {
        ...item,
        ...toFaseItem(res.data),
        inicio: faseForm.value.inicio,
        fin: faseForm.value.tipo === 'prueba' ? faseForm.value.inicio : faseForm.value.fin,
        tipo: faseForm.value.tipo,
        criterioAprobacion: faseForm.value.tipo === 'prueba' ? Number(faseForm.value.criterioAprobacion) : null,
        lugarRealizacion: faseForm.value.tipo === 'prueba' ? faseForm.value.lugarRealizacion : '',
        faseAnteriorId: faseForm.value.tipo === 'prueba' ? faseForm.value.faseAnteriorId : '',
      }
    })
  }
  isFaseModalOpen.value = false
}

const removeFase = async (id: string) => {
  await FasesService.remove(Number(id))
  fases.value = fases.value.filter((item) => item.id !== id)
}

const isMaterialModalOpen = ref(false)
const selectedFaseId = ref<string>('')
const materialTab = ref<'nuevo' | 'existente'>('nuevo')
const materialForm = ref({ nombre: '', tipo: 'temario' as MaterialTipo, enlace: '' })
const selectedExisting = ref<string[]>([])

const existingMaterials = [
  { id: 'mat-ex-001', nombre: 'Temario Oficial 2025', descripcion: 'Contenidos anteriores', tipo: 'temario' as MaterialTipo },
  { id: 'mat-ex-002', nombre: 'Video Introducción a Probabilidad', descripcion: 'Clase grabada', tipo: 'video' as MaterialTipo },
  { id: 'mat-ex-003', nombre: 'Práctica Estadística', descripcion: 'Ejercicios resueltos', tipo: 'ejercicios' as MaterialTipo },
]

const openMaterialModal = (faseId: string) => {
  selectedFaseId.value = faseId
  materialTab.value = 'nuevo'
  materialForm.value = { nombre: '', tipo: 'temario', enlace: '' }
  selectedExisting.value = []
  isMaterialModalOpen.value = true
}

const toggleExisting = (id: string) => {
  selectedExisting.value = selectedExisting.value.includes(id)
    ? selectedExisting.value.filter((item) => item !== id)
    : [...selectedExisting.value, id]
}

const saveMaterial = () => {
  if (!selectedFaseId.value) return
  const fase = fases.value.find((item) => item.id === selectedFaseId.value)
  if (!fase) return

  if (materialTab.value === 'nuevo') {
    if (!materialForm.value.nombre) return
    fase.materiales.push({ id: `mat-${Date.now()}`, nombre: materialForm.value.nombre, tipo: materialForm.value.tipo })
  } else {
    const toAdd = existingMaterials
      .filter((item) => selectedExisting.value.includes(item.id))
      .map((item) => ({ id: `mat-${Date.now()}-${item.id}`, nombre: item.nombre, tipo: item.tipo }))
    fase.materiales.push(...toAdd)
  }

  isMaterialModalOpen.value = false
}

const removeMaterial = (faseId: string, materialId: string) => {
  const fase = fases.value.find((item) => item.id === faseId)
  if (!fase) return
  fase.materiales = fase.materiales.filter((item) => item.id !== materialId)
}

const estudiantes = ref<EstudianteItem[]>([])
const isLoadingEstudiantes = ref(false)
const estudiantesError = ref('')
const statusFilter = ref<'TODOS' | EstadoInscripcion | 'SIN_ESTADO'>('TODOS')

const toStudentItem = (item: EstudianteResponseDTO): EstudianteItem => ({
  id: String(item.id_estudiante),
  nombres: item.nombres,
  apellidos: [item.paterno, item.materno].filter(Boolean).join(' '),
  carnet: item.carnet_identidad,
  email: item.correo ?? 'Sin correo',
  telefono: item.telefono ? String(item.telefono) : 'Sin telefono',
  colegio: item.nombre_colegio ?? `Colegio ${item.id_colegio}`,
  curso: String(item.curso),
  nivel: item.nivel,
  estado: item.estado_inscripcion ?? 'SIN_ESTADO',
  fechaInscripcion: item.fecha_inscripcion ?? 'Sin fecha',
  fechaNacimiento: item.fecha_nacimiento,
  rude: item.rude ?? 'Sin RUDE',
})

const loadEstudiantes = async () => {
  if (!Number.isFinite(numericCategoriaId.value)) return
  isLoadingEstudiantes.value = true
  estudiantesError.value = ''
  try {
    const res = await EstudiantesService.list({ page: 1, limit: 200 })
    estudiantes.value = res.data.items
      .filter((item) => {
        if (item.id_categoria != null) return item.id_categoria === numericCategoriaId.value
        return item.curso === Number(categoria.value.curso) && item.nivel === categoria.value.grado
      })
      .map(toStudentItem)
  } catch {
    estudiantes.value = []
    estudiantesError.value = 'No se pudieron cargar los estudiantes.'
  } finally {
    isLoadingEstudiantes.value = false
  }
}

watch(
  categoria,
  () => {
    loadEstudiantes()
  },
  { deep: true },
)

const searchStudent = ref('')
const selectedStudent = ref<EstudianteItem | null>(null)
const isStudentModalOpen = ref(false)

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

const studentStatusLabel = (status: EstudianteItem['estado']) => {
  if (status === 'SIN_ESTADO') return 'REGISTRADO'
  return status
}

const materialTypeClass = (type: MaterialTipo) => {
  if (type === 'video') return 'bg-error/10 text-error border-error/20'
  if (type === 'temario') return 'bg-success/10 text-success border-success/20'
  if (type === 'ejercicios') return 'bg-warning/10 text-warning border-warning/20'
  if (type === 'practica') return 'bg-info/10 text-info border-info/20'
  if (type === 'examen') return 'bg-secondary/10 text-secondary border-secondary/20'
  if (type === 'solucionario') return 'bg-success/10 text-success border-success/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}

const faseTypeClass = (type: FaseTipo) => {
  return type === 'prueba' ? 'bg-error/10 text-error border-error/20' : 'bg-secondary/10 text-secondary border-secondary/20'
}
</script>

<template>
  <div class="space-y-6 p-4">
    <header class="sticky top-0 z-20 rounded-xl border border-gray-200 border-t-4 border-t-accent bg-white p-4 shadow-soft">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="goBackToConvocatoria">
            <ArrowLeft class="h-4 w-4" />
            Volver a Categorías
          </Button>
          <div class="text-sm text-text-muted">
            <span>Gestión de Categoría</span>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <CategorySymbol :name="categoriaForm.nombre" class="h-12 w-12 bg-accent text-2xl text-primary shadow-sm" />
        <div>
          <h1 class="font-heading text-2xl font-bold text-text-main">{{ isLoadingCategoria ? 'Cargando...' : categoriaForm.nombre }}</h1>
          <p v-if="categoriaError" class="mt-1 text-sm font-medium text-error">{{ categoriaError }}</p>
          <div class="mt-1 flex items-center gap-2">
            <Badge variant="outline" class="border-info/20 bg-info/10 text-info">{{ categoriaForm.curso }}</Badge>
            <Badge variant="outline" class="border-secondary/20 bg-secondary/10 text-secondary">{{ categoriaForm.grado }}</Badge>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
      <CategoriaGestionTabs v-model:active-tab="activeTab" />

      <main class="min-w-0 flex-1 space-y-6">

    <Card v-if="activeTab === 'fases'" class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2"><CalendarDays class="h-5 w-5 text-accent" />Fases de la Categoría</CardTitle>
            <p class="mt-1 text-sm text-text-muted">Administra cronograma y materiales.</p>
          </div>
          <Button variant="accent" @click="openCreateFase" class="flex items-center gap-2"><Plus class="h-4 w-4" />Nueva Fase</Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-3 p-6">
        <div v-if="isLoadingFases" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">
          Cargando fases...
        </div>
        <div v-else-if="fasesError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
          {{ fasesError }}
        </div>
        <div v-else-if="fases.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-text-muted">
          Sin fases registradas
        </div>
        <div v-for="fase in fases" :key="fase.id" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-accent/40">
          <div class="p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl" :class="fase.tipo === 'prueba' ? 'bg-gradient-to-br from-accent to-accent-dark' : 'bg-gradient-to-br from-secondary to-[#0090B0]'">
                  <Trophy v-if="fase.tipo === 'prueba'" class="h-5 w-5 text-white" />
                  <BookOpen v-else class="h-5 w-5 text-white" />
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-bold text-text-main">{{ fase.nombre }}</p>
                    <Badge variant="outline" :class="`border px-2 py-0.5 ${faseTypeClass(fase.tipo)}`">{{ fase.tipo === 'prueba' ? 'Prueba' : 'Preparación' }}</Badge>
                    <Badge variant="outline" class="border-info/20 bg-info/10 text-info px-2 py-0.5">{{ fase.modalidad }}</Badge>
                  </div>
                  <p class="mt-1 flex items-center gap-2 text-sm text-text-muted"><Clock class="h-4 w-4 text-text-muted" />{{ fase.inicio }} → {{ fase.fin }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="sm" @click="toggleExpand(fase.id)" class="text-text-muted hover:bg-gray-100">
                  <ChevronUp v-if="expanded.includes(fase.id)" class="h-5 w-5" />
                  <ChevronDown v-else class="h-5 w-5" />
                </Button>
                <Button variant="outline" size="sm" @click="openMaterialModal(fase.id)" class="flex items-center gap-1.5 hover:border-accent/40 hover:bg-accent/10"><Upload class="h-4 w-4" />Material</Button>
                <Button variant="outline" size="sm" @click="openEditFase(fase)" class="text-text-muted"><Edit class="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" class="text-error hover:bg-error/10" @click="removeFase(fase.id)"><Trash2 class="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div v-if="expanded.includes(fase.id)" class="border-t border-gray-200 bg-gray-50 p-4">
            <p class="text-sm text-text-muted">{{ fase.descripcion }}</p>
            <div v-if="fase.tipo === 'prueba'" class="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm sm:grid-cols-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-accent-dark">Criterio</p>
                <p class="font-semibold text-text-main">{{ fase.criterioAprobacion ?? 'Sin definir' }}</p>
              </div>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-accent-dark">Lugar</p>
                <p class="font-semibold text-text-main">{{ fase.lugarRealizacion || 'Sin definir' }}</p>
              </div>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-accent-dark">Fase anterior</p>
                <p class="font-semibold text-text-main">{{ fase.faseAnteriorId || 'Ninguna' }}</p>
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <p class="text-sm font-bold text-text-main">Materiales de Estudio</p>
              <div v-if="fase.materiales.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-sm text-text-muted">
                Sin materiales adjuntos
              </div>
              <div v-for="material in fase.materiales" :key="material.id" class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                <div class="flex items-center gap-2">
                  <File class="h-4 w-4 text-text-muted" />
                  <p class="text-sm font-bold text-text-main">{{ material.nombre }}</p>
                  <Badge variant="outline" :class="`border capitalize px-2 py-0.5 ${materialTypeClass(material.tipo)}`">{{ material.tipo }}</Badge>
                </div>
                <div class="flex items-center gap-1">
                  <Button variant="ghost" size="sm" class="text-text-muted hover:text-primary"><Eye class="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" class="text-error hover:bg-error/10" @click="removeMaterial(fase.id, material.id)"><Trash2 class="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'estudiantes'" class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader class="border-b border-gray-200">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <CardTitle class="flex items-center gap-2"><Users class="h-5 w-5 text-primary" />Estudiantes Inscritos</CardTitle>
          <Badge variant="outline" class="w-fit border-info/20 bg-info/10 px-3 py-1 text-info">{{ filteredStudents.length }} estudiantes</Badge>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <div class="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div class="relative max-w-md">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchStudent" class="h-11 w-full rounded-md border border-gray-300 px-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar por nombre, carnet, email o colegio..." />
          </div>
          <select v-model="statusFilter" class="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="SIN_ESTADO">Registrado</option>
          </select>
        </div>

        <div class="space-y-3">
          <div v-if="isLoadingEstudiantes" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">Cargando estudiantes...</div>
          <div v-else-if="estudiantesError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">{{ estudiantesError }}</div>
          <div v-else-if="filteredStudents.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-text-muted">Sin estudiantes para esta categoria.</div>
          <div v-for="student in filteredStudents" :key="student.id" class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
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
                    <span class="inline-flex items-center gap-1"><Mail class="h-3.5 w-3.5 text-text-muted" />{{ student.email }}</span>
                    <span class="inline-flex items-center gap-1"><Phone class="h-3.5 w-3.5 text-text-muted" />{{ student.telefono }}</span>
                    <span class="inline-flex items-center gap-1"><Building2 class="h-3.5 w-3.5 text-text-muted" />{{ student.colegio }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click="openStudentModal(student)" class="flex items-center gap-1.5"><Eye class="h-4 w-4" />Ver</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'resultados'" class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardContent class="py-16 text-center">
        <Trophy class="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p class="font-bold text-text-main">Resultados y Clasificación</p>
        <p class="text-sm text-text-muted mt-1">Sección preparada para publicar resultados por fase.</p>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'configuracion'" class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader class="border-b border-gray-200">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle class="flex items-center gap-2"><Settings class="h-5 w-5 text-accent" />Configuración de categoría</CardTitle>
            <p class="mt-1 text-sm text-text-muted">Edita los datos principales de la categoría.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button v-if="!isEditingCategory" variant="outline" class="flex items-center gap-2" @click="isEditingCategory = true">
              <Edit class="h-4 w-4" />
              Editar datos
            </Button>
            <template v-else>
              <Button variant="outline" class="flex items-center gap-2" @click="cancelCategoriaEdit">
                <XCircle class="h-4 w-4" />
                Cancelar
              </Button>
              <Button variant="accent" class="flex items-center gap-2" @click="saveCategoria">
                <Save class="h-4 w-4" />
                Guardar cambios
              </Button>
            </template>
            <Button class="bg-error text-white hover:bg-error/90 flex items-center gap-2" @click="deleteCategoria">
              <Trash2 class="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-5 p-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-bold text-text-main">Nombre</label>
            <input v-model="categoriaForm.nombre" :disabled="!isEditingCategory" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Curso</label>
            <input v-model="categoriaForm.curso" :disabled="!isEditingCategory" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Grado</label>
            <input v-model="categoriaForm.grado" :disabled="!isEditingCategory" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
        </div>
      </CardContent>
    </Card>

      </main>
    </div>

    <!-- Modals (Fase, Material, Estudiante) -->
    <div v-if="isFaseModalOpen" class="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:items-center sm:p-4">
      <Card class="ope-calendar-theme my-auto w-full max-w-4xl border-gray-200 bg-white">
        <CardHeader><CardTitle>{{ editingFaseId ? 'Editar Fase' : 'Crear Nueva Fase' }}</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="relative rounded-xl border border-gray-200 bg-gray-50 p-1">
            <div class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg shadow-sm transition-all duration-300 ease-out" :class="faseForm.tipo === 'preparacion' ? 'translate-x-0 bg-secondary' : 'translate-x-full bg-accent'" />
            <div class="relative grid grid-cols-2 gap-1">
              <button type="button" :disabled="Boolean(editingFaseId)" class="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-300 disabled:cursor-not-allowed" :class="faseForm.tipo === 'preparacion' ? 'text-white' : 'text-text-muted hover:text-primary'" @click="faseForm.tipo = 'preparacion'">
                <BookOpen class="h-4 w-4" />
                Preparación
              </button>
              <button type="button" :disabled="Boolean(editingFaseId)" class="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-300 disabled:cursor-not-allowed" :class="faseForm.tipo === 'prueba' ? 'text-primary' : 'text-text-muted hover:text-primary'" @click="faseForm.tipo = 'prueba'">
                <Trophy class="h-4 w-4" />
                Prueba
              </button>
            </div>
          </div>
          <p v-if="editingFaseId" class="text-xs font-medium text-text-muted">El tipo de fase no se puede cambiar al editar.</p>
          <div><label class="mb-1 block text-sm font-bold text-text-main">Nombre *</label><input v-model="faseForm.nombre" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label class="mb-1 block text-sm font-bold text-text-main">Modalidad *</label><select v-model="faseForm.modalidad" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"><option value="virtual">Virtual</option><option value="presencial">Presencial</option><option value="semipresencial">Semipresencial</option></select></div>
            <div v-if="faseForm.tipo === 'prueba'"><label class="mb-1 block text-sm font-bold text-text-main">Criterio aprobación *</label><input v-model.number="faseForm.criterioAprobacion" type="number" min="0" max="100" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
            <div v-if="faseForm.tipo === 'prueba'"><label class="mb-1 block text-sm font-bold text-text-main">Fase anterior</label><select v-model="faseForm.faseAnteriorId" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"><option value="">Sin fase anterior</option><option v-for="fase in fases.filter((item) => item.id !== editingFaseId)" :key="fase.id" :value="fase.id">{{ fase.nombre }}</option></select></div>
            <div v-if="faseForm.tipo === 'prueba'"><label class="mb-1 block text-sm font-bold text-text-main">Lugar realización</label><input v-model="faseForm.lugarRealizacion" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Ej: Auditorio UMSA" /></div>
          </div>
          <div v-if="faseForm.tipo === 'preparacion'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3">
              <label class="mb-2 block text-sm font-semibold text-text-main">Fecha inicio *</label>
              <VDatePicker v-model="faseInicioDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="today" expanded />
            </div>
            <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!faseInicioDate ? 'opacity-60' : ''">
              <label class="mb-2 block text-sm font-semibold text-text-main">Fecha fin *</label>
              <VDatePicker v-model="faseFinDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minFaseFinDate" expanded :disabled="!faseInicioDate" />
              <p v-if="!faseInicioDate" class="mt-2 text-xs font-medium text-text-muted">Selecciona primero la fecha de inicio.</p>
            </div>
          </div>
          <div v-else class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3">
            <label class="mb-2 block text-sm font-semibold text-text-main">Fecha realización *</label>
            <VDatePicker v-model="faseInicioDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="today" expanded />
          </div>
          <div v-if="faseForm.tipo === 'preparacion'" class="rounded-xl border border-secondary/20 bg-secondary/10 p-3 text-sm font-medium text-secondary">Preparación usa rango de fechas: inicio y fin.</div>
          <div v-else class="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm font-medium text-accent-dark">Prueba usa fecha única, criterio de aprobación y datos opcionales de realización.</div>
          <div><label class="mb-1 block text-sm font-bold text-text-main">Descripción</label><textarea v-model="faseForm.descripcion" class="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"></textarea></div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="isFaseModalOpen = false">Cancelar</Button>
            <Button variant="accent" @click="saveFase">{{ editingFaseId ? 'Guardar Cambios' : 'Crear Fase' }}</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="isMaterialModalOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-2xl border-gray-200">
        <CardHeader><CardTitle>Agregar Material</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="flex gap-2">
            <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="materialTab === 'nuevo' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="materialTab = 'nuevo'">Material Nuevo</button>
            <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="materialTab === 'existente' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="materialTab = 'existente'">Material Existente</button>
          </div>

          <div v-if="materialTab === 'nuevo'" class="space-y-3">
            <div><label class="mb-1 block text-sm font-bold text-text-main">Nombre *</label><input v-model="materialForm.nombre" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
            <div><label class="mb-1 block text-sm font-bold text-text-main">Tipo *</label><select v-model="materialForm.tipo" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"><option value="video">Video</option><option value="temario">Temario</option><option value="ejercicios">Ejercicios</option><option value="practica">Práctica</option><option value="examen">Examen</option><option value="solucionario">Solucionario</option><option value="otro">Otro</option></select></div>
            <div><label class="mb-1 block text-sm font-bold text-text-main">Enlace</label><input v-model="materialForm.enlace" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="https://..." /></div>
            <div class="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center text-sm text-text-muted cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload class="mx-auto mb-2 h-6 w-6 text-text-muted" />
              Subir archivo (opcional)
            </div>
          </div>

          <div v-else class="space-y-2">
            <div v-for="item in existingMaterials" :key="item.id" class="cursor-pointer rounded-xl border p-3 transition-colors" :class="selectedExisting.includes(item.id) ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/40'" @click="toggleExisting(item.id)">
              <p class="font-bold text-text-main">{{ item.nombre }}</p>
              <p class="text-xs text-text-muted mt-1">{{ item.descripcion }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <Button variant="outline" @click="isMaterialModalOpen = false">Cancelar</Button>
            <Button variant="accent" @click="saveMaterial" class="flex items-center gap-2"><Plus class="h-4 w-4" />Agregar Material</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="isStudentModalOpen && selectedStudent" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-2xl border-gray-200">
        <CardHeader><CardTitle>Información del Estudiante</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-3 border-b border-gray-200 pb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
              {{ selectedStudent.nombres.charAt(0) }}{{ selectedStudent.apellidos.charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-text-main">{{ selectedStudent.nombres }} {{ selectedStudent.apellidos }}</p>
              <p class="text-sm text-text-muted mt-0.5">CI: {{ selectedStudent.carnet }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 mt-4">
            <p class="text-sm text-text-main flex items-center"><Mail class="mr-2 h-4 w-4 text-text-muted" />{{ selectedStudent.email }}</p>
            <p class="text-sm text-text-main flex items-center"><Phone class="mr-2 h-4 w-4 text-text-muted" />{{ selectedStudent.telefono }}</p>
            <p class="text-sm text-text-main flex items-center"><Building2 class="mr-2 h-4 w-4 text-text-muted" />{{ selectedStudent.colegio }}</p>
            <p class="text-sm text-text-main flex items-center"><BookOpen class="mr-2 h-4 w-4 text-text-muted" />{{ selectedStudent.curso }} {{ selectedStudent.nivel }}</p>
            <p class="text-sm text-text-main">Nacimiento: {{ selectedStudent.fechaNacimiento }}</p>
            <p class="text-sm text-text-main">RUDE: {{ selectedStudent.rude }}</p>
            <p class="text-sm text-text-main">Inscripcion: {{ selectedStudent.fechaInscripcion }}</p>
            <p class="text-sm text-text-main">Estado: {{ studentStatusLabel(selectedStudent.estado) }}</p>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <Button variant="outline" @click="isStudentModalOpen = false">Cerrar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>


