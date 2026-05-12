<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  AlertCircle,
  CheckCheck,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  Settings,
  Users,
  Eye,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Trophy,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'
import GreekLetterPicker from '@/shared/components/ui/molecules/GreekLetterPicker.vue'
import ConvocatoriaDetailTabs from '@/modules/admin/components/ConvocatoriaDetailTabs.vue'
import MaterialCard from '@/modules/admin/components/MaterialCard.vue'
import { useConvocatoria } from '@/modules/admin/composables/useConvocatorias'
import { type AdminConvocatoria } from '@/modules/admin/data/admin.data'
import { CategoriasService } from '@/modules/convocatorias/services/categorias.service'
import { EstudiantesService } from '@/modules/convocatorias/services/estudiantes.service'
import { MaterialesService } from '@/modules/convocatorias/services/materiales.service'
import type { CategoriaResponseDTO, NivelEducativo } from '@/modules/convocatorias/types/categorias.api'
import type { EstadoInscripcion, EstudianteResponseDTO } from '@/modules/convocatorias/types/estudiantes.api'
import type { MaterialResponseDTO } from '@/modules/convocatorias/types/materiales.api'

type TabKey = 'general' | 'categorias' | 'inscritos' | 'material' | 'configuracion'

interface CategoriaRow {
  id: string
  nombre: string
  curso: string
  grado: string
}

interface EstudianteRow {
  id: string
  nombre: string
  carnet: string
  curso: string
  nivel: string
  correo: string
  telefono: string
  colegio: string
  estado: EstadoInscripcion | 'SIN_ESTADO'
}

const route = useRoute()
const router = useRouter()

const convocatoriaId = typeof route.params.convocatoriaId === 'string' ? route.params.convocatoriaId : ''
const numericConvocatoriaId = computed(() => Number(convocatoriaId))
const { convocatoria, update } = useConvocatoria(convocatoriaId)

const activeTab = ref<TabKey>('general')
watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'general' || tab === 'categorias' || tab === 'inscritos' || tab === 'material' || tab === 'configuracion') {
      activeTab.value = tab
    }
  },
  { immediate: true },
)

const localConvocatoria = ref({
  nombre: '',
  gestion: '',
  descripcion: '',
  inicioOlimpiada: '',
  finOlimpiada: '',
  inicioInscripcion: '',
  finInscripcion: '',
  estado: 'Borrador',
  inscritos: 0,
  categorias: 0,
  fases: 0,
})

const resetLocalConvocatoria = (value: AdminConvocatoria) => {
  localConvocatoria.value = {
    nombre: value.nombre,
    gestion: String(value.gestion),
    descripcion: value.descripcion,
    inicioOlimpiada: value.inicioOlimpiada,
    finOlimpiada: value.finOlimpiada,
    inicioInscripcion: value.inicioInscripcion,
    finInscripcion: value.finInscripcion,
    estado: value.estado,
    inscritos: value.inscritos,
    categorias: value.categorias,
    fases: value.fases,
  }
}

watch(
  convocatoria,
  (value) => {
    if (!value) return
    resetLocalConvocatoria(value)
  },
  { immediate: true },
)

const isEditingData = ref(false)
const isEditingFiles = ref(false)

const categorias = ref<CategoriaRow[]>([])
const isLoadingCategorias = ref(false)
const categoriasError = ref('')
const materiales = ref<MaterialResponseDTO[]>([])
const isLoadingMateriales = ref(false)
const materialesError = ref('')
const estudiantes = ref<EstudianteRow[]>([])
const isLoadingEstudiantes = ref(false)
const estudiantesError = ref('')
const estudianteSearch = ref('')
const estudianteStatusFilter = ref<'TODOS' | EstadoInscripcion | 'SIN_ESTADO'>('TODOS')

const isCategoriaModalOpen = ref(false)
const nuevaCategoria = ref({ nombre: '', curso: '', grado: 'SECUNDARIA' })
const cursosDisponibles = ['1', '2', '3', '4', '5', '6']

const toCategoriaRow = (item: CategoriaResponseDTO): CategoriaRow => ({
  id: String(item.id_categoria),
  nombre: item.nombre_categoria,
  curso: String(item.curso),
  grado: item.nivel,
})

const loadCategorias = async () => {
  if (!Number.isFinite(numericConvocatoriaId.value)) return
  isLoadingCategorias.value = true
  categoriasError.value = ''
  try {
    const res = await CategoriasService.list({ page: 1, limit: 100 })
    categorias.value = res.data.items
      .filter((item) => item.id_convocatoria === numericConvocatoriaId.value)
      .map(toCategoriaRow)
    localConvocatoria.value.categorias = categorias.value.length
  } catch {
    categorias.value = []
    categoriasError.value = 'No se pudieron cargar las categorias.'
  } finally {
    isLoadingCategorias.value = false
  }
}

const loadMateriales = async () => {
  if (!Number.isFinite(numericConvocatoriaId.value)) return
  isLoadingMateriales.value = true
  materialesError.value = ''
  try {
    const res = await MaterialesService.listAdmin({ page: 1, limit: 100 })
    const items = res.data.items
    const scoped = items.filter((item) => item.id_convocatoria === numericConvocatoriaId.value)
    materiales.value = scoped.length ? scoped : items.filter((item) => item.id_convocatoria == null)
  } catch {
    materiales.value = []
    materialesError.value = 'No se pudieron cargar los materiales.'
  } finally {
    isLoadingMateriales.value = false
  }
}

const toEstudianteRow = (item: EstudianteResponseDTO): EstudianteRow => ({
  id: String(item.id_estudiante),
  nombre: [item.nombres, item.paterno, item.materno].filter(Boolean).join(' '),
  carnet: item.carnet_identidad,
  curso: String(item.curso),
  nivel: item.nivel,
  correo: item.correo ?? 'Sin correo',
  telefono: item.telefono ? String(item.telefono) : 'Sin telefono',
  colegio: item.nombre_colegio ?? `Colegio ${item.id_colegio}`,
  estado: item.estado_inscripcion ?? 'SIN_ESTADO',
})

const loadEstudiantes = async () => {
  if (!Number.isFinite(numericConvocatoriaId.value)) return
  isLoadingEstudiantes.value = true
  estudiantesError.value = ''
  try {
    const res = await EstudiantesService.list({ page: 1, limit: 200 })
    estudiantes.value = res.data.items
      .filter((item) => {
        if (item.id_convocatoria != null) return item.id_convocatoria === numericConvocatoriaId.value
        if (item.id_categoria != null) return categorias.value.some((categoria) => Number(categoria.id) === item.id_categoria)
        return categorias.value.some((categoria) => Number(categoria.curso) === item.curso && categoria.grado === item.nivel)
      })
      .map(toEstudianteRow)
    localConvocatoria.value.inscritos = estudiantes.value.length
  } catch {
    estudiantes.value = []
    estudiantesError.value = 'No se pudieron cargar los estudiantes.'
  } finally {
    isLoadingEstudiantes.value = false
  }
}

watch(
  numericConvocatoriaId,
  () => {
    loadCategorias().then(loadEstudiantes)
    loadMateriales()
  },
  { immediate: true },
)

watch(categorias, () => loadEstudiantes(), { deep: true })

const filteredEstudiantes = computed(() => {
  const term = estudianteSearch.value.trim().toLowerCase()
  return estudiantes.value.filter((item) => {
    const byStatus = estudianteStatusFilter.value === 'TODOS' || item.estado === estudianteStatusFilter.value
    if (!term) return byStatus
    return byStatus && (
      item.nombre.toLowerCase().includes(term) ||
      item.carnet.includes(term) ||
      item.correo.toLowerCase().includes(term) ||
      item.colegio.toLowerCase().includes(term)
    )
  })
})

const estudianteStatusClass = (status: EstudianteRow['estado']) => {
  if (status === 'APROBADO') return 'border-success/20 bg-success/10 text-success'
  if (status === 'RECHAZADO') return 'border-error/20 bg-error/10 text-error'
  if (status === 'PENDIENTE') return 'border-warning/20 bg-warning/10 text-warning'
  return 'border-gray-200 bg-gray-100 text-text-muted'
}

const estudianteStatusLabel = (status: EstudianteRow['estado']) => status === 'SIN_ESTADO' ? 'REGISTRADO' : status

const createCategoria = async () => {
  if (!nuevaCategoria.value.nombre.trim() || !nuevaCategoria.value.curso.trim()) return
  const res = await CategoriasService.create({
    id_convocatoria: numericConvocatoriaId.value,
    nombre_categoria: nuevaCategoria.value.nombre.trim(),
    curso: Number(nuevaCategoria.value.curso),
    nivel: nuevaCategoria.value.grado as NivelEducativo,
    estado: 'LISTA',
  })
  categorias.value = [toCategoriaRow(res.data), ...categorias.value]
  localConvocatoria.value.categorias = categorias.value.length
  nuevaCategoria.value = { nombre: '', curso: '', grado: 'SECUNDARIA' }
  isCategoriaModalOpen.value = false
}

const removeCategoria = async (id: string) => {
  await CategoriasService.remove(Number(id))
  categorias.value = categorias.value.filter((item) => item.id !== id)
  localConvocatoria.value.categorias = categorias.value.length
}

const manageCategoria = (id: string) => {
  router.push(`/admin/convocatoria/${convocatoriaId}/categoria/${id}/gestionar`)
}

const archivos = ref<{ convocatoriaPDF: File | null; reglamentoPDF: File | null; aficheJPG: File | null }>({
  convocatoriaPDF: null,
  reglamentoPDF: null,
  aficheJPG: null,
})

const fileReady = computed(() => Boolean(archivos.value.convocatoriaPDF && archivos.value.reglamentoPDF && archivos.value.aficheJPG))

const materialesConvocatoria = computed(() => materiales.value)

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

const parseDateOnly = (value: string) => {
  if (!value) return null
  const [datePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const parseDateTime = (value: string) => {
  if (!value) return null
  const normalized = value.length === 10 ? `${value}T00:00:00` : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDateInputValue = (date: Date | null) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toDateTimeInputValue = (date: Date | null) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const today = startOfDay(new Date())
const editInicioOlimpiadaDate = computed({
  get: () => parseDateOnly(localConvocatoria.value.inicioOlimpiada),
  set: (date: Date | null) => {
    localConvocatoria.value.inicioOlimpiada = toDateInputValue(date)
    if (!date) {
      localConvocatoria.value.finOlimpiada = ''
      localConvocatoria.value.inicioInscripcion = ''
      localConvocatoria.value.finInscripcion = ''
      return
    }
    const fin = parseDateOnly(localConvocatoria.value.finOlimpiada)
    if (fin && startOfDay(fin) < startOfDay(date)) localConvocatoria.value.finOlimpiada = ''
  },
})
const editFinOlimpiadaDate = computed({
  get: () => parseDateOnly(localConvocatoria.value.finOlimpiada),
  set: (date: Date | null) => {
    localConvocatoria.value.finOlimpiada = toDateInputValue(date)
    if (!date) {
      localConvocatoria.value.inicioInscripcion = ''
      localConvocatoria.value.finInscripcion = ''
      return
    }
    const max = endOfDay(date)
    const inicioInscripcion = parseDateTime(localConvocatoria.value.inicioInscripcion)
    const finInscripcion = parseDateTime(localConvocatoria.value.finInscripcion)
    if (inicioInscripcion && inicioInscripcion > max) localConvocatoria.value.inicioInscripcion = ''
    if (finInscripcion && finInscripcion > max) localConvocatoria.value.finInscripcion = ''
  },
})
const editInicioInscripcionDate = computed({
  get: () => parseDateTime(localConvocatoria.value.inicioInscripcion),
  set: (date: Date | null) => {
    localConvocatoria.value.inicioInscripcion = toDateTimeInputValue(date)
    if (!date) {
      localConvocatoria.value.finInscripcion = ''
      return
    }
    const finInscripcion = parseDateTime(localConvocatoria.value.finInscripcion)
    if (finInscripcion && finInscripcion < date) localConvocatoria.value.finInscripcion = ''
  },
})
const editFinInscripcionDate = computed({
  get: () => parseDateTime(localConvocatoria.value.finInscripcion),
  set: (date: Date | null) => {
    localConvocatoria.value.finInscripcion = toDateTimeInputValue(date)
  },
})
const minEditInicioOlimpiada = computed(() => today)
const minEditFinOlimpiada = computed(() => editInicioOlimpiadaDate.value ? startOfDay(editInicioOlimpiadaDate.value) : undefined)
const minEditInscripcion = computed(() => editInicioOlimpiadaDate.value ? startOfDay(editInicioOlimpiadaDate.value) : undefined)
const maxEditInscripcion = computed(() => editFinOlimpiadaDate.value ? endOfDay(editFinOlimpiadaDate.value) : undefined)
const minEditFinInscripcion = computed(() => editInicioInscripcionDate.value ?? minEditInscripcion.value)

const setFile = (event: Event, field: 'convocatoriaPDF' | 'reglamentoPDF' | 'aficheJPG') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  archivos.value[field] = file
}

const saveData = () => {
  if (!convocatoria.value) return
  update({
    nombre: localConvocatoria.value.nombre,
    gestion: Number(localConvocatoria.value.gestion),
    descripcion: localConvocatoria.value.descripcion,
    inicioOlimpiada: localConvocatoria.value.inicioOlimpiada,
    finOlimpiada: localConvocatoria.value.finOlimpiada,
    inicioInscripcion: localConvocatoria.value.inicioInscripcion,
    finInscripcion: localConvocatoria.value.finInscripcion,
    estado: localConvocatoria.value.estado as AdminConvocatoria['estado'],
    inscritos: Number(localConvocatoria.value.inscritos),
    categorias: Number(localConvocatoria.value.categorias),
    fases: Number(localConvocatoria.value.fases),
  })
  isEditingData.value = false
}

const cancelDataEdit = () => {
  if (convocatoria.value) resetLocalConvocatoria(convocatoria.value)
  isEditingData.value = false
}

const publish = () => {
  if (!fileReady.value) {
    activeTab.value = 'configuracion'
    return
  }
  update({ estado: 'Activa' })
  localConvocatoria.value.estado = 'Activa'
}

const statusClass = (status: string) => {
  if (status === 'Activa') return 'bg-success/10 text-success border-success/20'
  if (status === 'Borrador') return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}
</script>

<template>
  <div v-if="!convocatoria" class="py-20 text-center">
    <h1 class="font-heading text-2xl font-bold text-text-main">Convocatoria no encontrada</h1>
    <Button class="mt-5" @click="router.push('/admin/convocatorias')"><ArrowLeft class="h-4 w-4" />Volver</Button>
  </div>

  <div v-else class="space-y-6 p-4">
    
    <header class="sticky top-0 z-20 rounded-xl border border-gray-200 border-t-4 border-t-accent bg-white p-4 shadow-soft">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="router.push('/admin/convocatorias')"><ArrowLeft class="h-4 w-4" />Volver</Button>
          <div>
            <h1 class="font-heading text-xl font-bold text-text-main">{{ localConvocatoria.nombre }}</h1>
            <div class="mt-1 flex items-center gap-2 text-sm text-text-muted">
              <span>Gestión {{ localConvocatoria.gestion }}</span>
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border', statusClass(localConvocatoria.estado)]">{{ localConvocatoria.estado }}</span>
            </div>
          </div>
        </div>
        <Button v-if="localConvocatoria.estado === 'Borrador'" variant="accent" class="flex items-center gap-2" @click="publish">
          <CheckCheck class="h-4 w-4" />
          TODO LISTO?
        </Button>
      </div>
    </header>
    
    <div v-if="localConvocatoria.estado === 'Borrador'" class="rounded-xl border border-warning/20 bg-warning/10 p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p class="text-sm font-medium text-warning">Convocatoria en borrador. Completa categorías, configuración y documentos.</p>
      </div>
    </div>

    <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
      <ConvocatoriaDetailTabs
        v-model:active-tab="activeTab"
        :categorias="categorias"
        @create-categoria="isCategoriaModalOpen = true"
        @manage-categoria="manageCategoria"
      />

      <main class="min-w-0 flex-1 space-y-6">

    <div v-if="activeTab === 'general'" class="space-y-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card class="shadow-soft border-gray-200 border-l-4 border-l-primary bg-white">
          <CardContent class="p-5">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2.5"><Users class="h-5 w-5 text-primary" /></div>
              <div><p class="text-xl font-bold text-text-main">{{ convocatoria.inscritos }}</p><p class="text-xs text-text-muted">Inscritos</p></div>
            </div>
          </CardContent>
        </Card>
        <Card class="shadow-soft border-gray-200 border-l-4 border-l-info bg-white">
          <CardContent class="p-5">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-info/10 p-2.5"><BookOpen class="h-5 w-5 text-info" /></div>
              <div><p class="text-xl font-bold text-text-main">{{ convocatoria.categorias }}</p><p class="text-xs text-text-muted">Categorías</p></div>
            </div>
          </CardContent>
        </Card>
        <Card class="shadow-soft border-gray-200 border-l-4 border-l-secondary bg-white">
          <CardContent class="p-5">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-secondary/10 p-2.5"><BarChart3 class="h-5 w-5 text-secondary" /></div>
              <div><p class="text-xl font-bold text-text-main">{{ convocatoria.fases }}</p><p class="text-xs text-text-muted">Fases</p></div>
            </div>
          </CardContent>
        </Card>
        <Card class="shadow-soft border-gray-200 border-l-4 border-l-accent bg-white">
          <CardContent class="p-5">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-accent/15 p-2.5"><Trophy class="h-5 w-5 text-accent" /></div>
              <div><p class="text-xl font-bold text-text-main">0</p><p class="text-xs text-text-muted">Ganadores</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><Settings class="h-5 w-5 text-accent" />Datos de la convocatoria</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-1/3 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden min-h-[300px] border border-gray-200">
           <img v-if="false" src="" class="w-full h-full object-cover" alt="Afiche" />
           <div v-else class="text-gray-400 flex flex-col items-center gap-2">
             <ImageIcon class="h-8 w-8" />
             <span class="text-sm font-medium">Sin afiche</span>
           </div>
        </div>
        <div class="w-full md:w-2/3 flex flex-col gap-4 content-start">
          <div>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-text-main">{{ localConvocatoria.nombre || 'Sin nombre' }}</h2>
            <p class="text-base font-medium text-text-muted mt-1">Gestión {{ localConvocatoria.gestion || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-text-main whitespace-pre-wrap leading-relaxed">{{ localConvocatoria.descripcion || 'Sin descripción detallada.' }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Inicio Olimpiadas</p>
              <p class="text-sm font-medium text-text-main">{{ localConvocatoria.inicioOlimpiada || 'Por definir' }}</p>
            </div>
            <div>
              <p class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Fin Olimpiadas</p>
              <p class="text-sm font-medium text-text-main">{{ localConvocatoria.finOlimpiada || 'Por definir' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-2 rounded-xl bg-accent/10 border border-accent/20 p-4">
            <div>
              <p class="text-xs text-accent-dark font-bold uppercase tracking-wider mb-1">Inicio Inscripción</p>
              <p class="text-sm font-medium text-text-main">{{ localConvocatoria.inicioInscripcion || 'Por definir' }}</p>
            </div>
            <div>
              <p class="text-xs text-accent-dark font-bold uppercase tracking-wider mb-1">Fin Inscripción</p>
              <p class="text-sm font-medium text-text-main">{{ localConvocatoria.finInscripcion || 'Por definir' }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><FileText class="h-5 w-5 text-primary" />Documentos de la convocatoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6 text-text-muted min-h-[250px]">
             <FileText class="h-10 w-10 mb-2 text-gray-400" />
             <span class="text-sm font-semibold">Convocatoria PDF</span>
          </div>
          <div class="rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6 text-text-muted min-h-[250px]">
             <FileText class="h-10 w-10 mb-2 text-gray-400" />
             <span class="text-sm font-semibold">Reglamento PDF</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>

    <Card v-if="activeTab === 'categorias'" class="border-gray-200 shadow-soft bg-white">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2"><BookOpen class="h-5 w-5 text-primary" />Categorías</CardTitle>
          <Button variant="accent" @click="isCategoriaModalOpen = true" class="flex items-center gap-2"><Plus class="h-4 w-4" />Nueva Categoría</Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-if="isLoadingCategorias" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">
          Cargando categorias...
        </div>
        <div v-else-if="categoriasError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
          {{ categoriasError }}
        </div>
        <div v-for="item in categorias" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-accent/40">
          <div class="flex items-center gap-3">
            <CategorySymbol :name="item.nombre" class="h-10 w-10 text-xl" />
            <div>
              <p class="font-bold text-text-main">{{ item.nombre }}</p>
              <div class="mt-1 flex items-center gap-2">
                <Badge variant="outline" class="border-info/20 bg-info/10 text-info px-2 py-0.5">{{ item.curso }}</Badge>
                <Badge variant="outline" class="border-secondary/20 bg-secondary/10 text-secondary px-2 py-0.5">{{ item.grado }}</Badge>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" @click="manageCategoria(item.id)" class="flex items-center gap-1.5 hover:border-accent/40 hover:bg-accent/10"><Eye class="h-4 w-4" />Gestionar</Button>
            <Button variant="ghost" @click="removeCategoria(item.id)"><Trash2 class="h-4 w-4 text-error" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'inscritos'" class="border-gray-200 shadow-soft bg-white">
      <CardHeader class="border-b border-gray-200">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <CardTitle class="flex items-center gap-2"><Users class="h-5 w-5 text-primary" />Estudiantes inscritos</CardTitle>
          <Badge variant="outline" class="w-fit border-info/20 bg-info/10 px-3 py-1 text-info">{{ filteredEstudiantes.length }} estudiantes</Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-4 p-6">
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div class="relative max-w-md">
            <input v-model="estudianteSearch" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Buscar estudiante..." />
          </div>
          <select v-model="estudianteStatusFilter" class="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="SIN_ESTADO">Registrado</option>
          </select>
        </div>

        <div v-if="isLoadingEstudiantes" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">Cargando estudiantes...</div>
        <div v-else-if="estudiantesError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">{{ estudiantesError }}</div>
        <div v-else-if="filteredEstudiantes.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-text-muted">Sin inscritos para esta convocatoria.</div>
        <div v-else class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs font-bold uppercase tracking-wider text-text-muted">
              <tr>
                <th class="px-4 py-3">Estudiante</th>
                <th class="px-4 py-3">Categoria</th>
                <th class="px-4 py-3">Contacto</th>
                <th class="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="student in filteredEstudiantes" :key="student.id" class="hover:bg-gray-50/70">
                <td class="px-4 py-3">
                  <p class="font-bold text-text-main">{{ student.nombre }}</p>
                  <p class="text-xs text-text-muted">CI {{ student.carnet }} - {{ student.colegio }}</p>
                </td>
                <td class="px-4 py-3 text-text-muted">{{ student.curso }} {{ student.nivel }}</td>
                <td class="px-4 py-3 text-text-muted">{{ student.correo }}<br />{{ student.telefono }}</td>
                <td class="px-4 py-3">
                  <Badge variant="outline" :class="`border px-2 py-0.5 ${estudianteStatusClass(student.estado)}`">{{ estudianteStatusLabel(student.estado) }}</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <div v-if="activeTab === 'material'" class="space-y-4">
      <div class="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center">
        <div>
          <h2 class="font-heading text-xl font-bold text-text-main">Material adjunto</h2>
          <p class="mt-1 text-sm text-text-muted">Recursos educativos globales asociados a esta convocatoria.</p>
        </div>
        <Badge variant="outline" class="w-fit border-info/20 bg-info/10 px-3 py-1 text-info">
          {{ materialesConvocatoria.length }} materiales
        </Badge>
      </div>

      <div v-if="isLoadingMateriales" class="rounded-xl border border-gray-200 bg-white p-6 text-sm text-text-muted shadow-soft">
        Cargando materiales...
      </div>
      <div v-else-if="materialesError" class="rounded-xl border border-error/20 bg-error/10 p-6 text-sm font-medium text-error">
        {{ materialesError }}
      </div>
      <div v-else-if="materialesConvocatoria.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <MaterialCard v-for="material in materialesConvocatoria" :key="material.id_material" :material="material" />
      </div>

      <Card v-else class="border-gray-200 bg-white shadow-soft">
        <CardContent class="py-14 text-center">
          <FileText class="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p class="font-bold text-text-main">Sin material adjunto</p>
          <p class="mt-1 text-sm text-text-muted">Esta convocatoria no tiene recursos educativos registrados.</p>
        </CardContent>
      </Card>
    </div>

    <Card v-if="activeTab === 'configuracion'" class="ope-calendar-theme border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader>
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <CardTitle class="flex items-center gap-2"><Settings class="h-5 w-5 text-accent" />Edición de datos</CardTitle>
          <div class="flex flex-wrap gap-2">
            <Button v-if="!isEditingData" variant="outline" class="flex items-center gap-2" @click="isEditingData = true">
              <Edit class="h-4 w-4" />
              Editar datos
            </Button>
            <template v-else>
              <Button variant="outline" class="flex items-center gap-2" @click="cancelDataEdit">
                <X class="h-4 w-4" />
                Cancelar
              </Button>
              <Button variant="accent" class="flex items-center gap-2" @click="saveData">
                <Save class="h-4 w-4" />
                Guardar cambios
              </Button>
            </template>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div>
              <h3 class="font-heading text-base font-bold text-text-main">Datos generales</h3>
              <p class="mt-1 text-sm text-text-muted">Información editable de la convocatoria.</p>
            </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Nombre</label>
            <input v-model="localConvocatoria.nombre" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Gestión</label>
            <input v-model="localConvocatoria.gestion" type="number" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Estado</label>
            <select v-model="localConvocatoria.estado" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="Borrador">Borrador</option>
              <option value="Activa">Activa</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
            <textarea v-model="localConvocatoria.descripcion" rows="4" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          </section>
          <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div>
              <h3 class="font-heading text-base font-bold text-text-main">Fechas de la convocatoria</h3>
              <p class="mt-1 text-sm text-text-muted">Activa edición para modificar los calendarios.</p>
            </div>
            <div class="grid grid-cols-1 gap-4 2xl:grid-cols-2">
          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData ? 'opacity-70' : ''">
            <label class="mb-2 block text-sm font-semibold text-text-main">Inicio Olimpiada</label>
            <VDatePicker v-model="editInicioOlimpiadaDate" mode="date" locale="es" :first-day-of-week="2" :min-date="minEditInicioOlimpiada" expanded :disabled="!isEditingData" />
          </div>
          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData || !editInicioOlimpiadaDate ? 'opacity-60' : ''">
            <label class="mb-2 block text-sm font-semibold text-text-main">Fin Olimpiada</label>
            <VDatePicker v-model="editFinOlimpiadaDate" mode="date" locale="es" :first-day-of-week="2" :min-date="minEditFinOlimpiada" expanded :disabled="!isEditingData || !editInicioOlimpiadaDate" />
            <p v-if="!editInicioOlimpiadaDate" class="mt-2 text-xs font-medium text-text-muted">Selecciona primero el inicio de olimpiada.</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData || !editInicioOlimpiadaDate || !editFinOlimpiadaDate ? 'opacity-60' : ''">
            <label class="mb-2 block text-sm font-semibold text-text-main">Inicio Inscripción</label>
            <VDatePicker v-model="editInicioInscripcionDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minEditInscripcion" :max-date="maxEditInscripcion" expanded :disabled="!isEditingData || !editInicioOlimpiadaDate || !editFinOlimpiadaDate" />
            <p v-if="!editInicioOlimpiadaDate || !editFinOlimpiadaDate" class="mt-2 text-xs font-medium text-text-muted">Define primero el periodo de olimpiada.</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData || !editInicioInscripcionDate ? 'opacity-60' : ''">
            <label class="mb-2 block text-sm font-semibold text-text-main">Fin Inscripción</label>
            <VDatePicker v-model="editFinInscripcionDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minEditFinInscripcion" :max-date="maxEditInscripcion" expanded :disabled="!isEditingData || !editInicioInscripcionDate" />
            <p v-if="!editInicioInscripcionDate" class="mt-2 text-xs font-medium text-text-muted">Selecciona primero el inicio de inscripcion.</p>
          </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'configuracion'" class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2"><FileText class="h-5 w-5 text-accent" />Documentos requeridos</CardTitle>
          <Button v-if="!isEditingFiles" variant="outline" @click="isEditingFiles = true" class="flex items-center gap-2"><Edit class="h-4 w-4" />Editar Documentos</Button>
          <Button v-else variant="outline" @click="isEditingFiles = false" class="flex items-center gap-2"><X class="h-4 w-4" />Cancelar</Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-5">
        <div v-if="!fileReady" class="rounded-xl border border-info/20 bg-info/10 p-3 text-sm text-info font-medium">Documentos pendientes. Completa los 3 para publicar.</div>
        <div v-else class="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success font-medium">Configuración completa.</div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="space-y-2 rounded-xl border border-gray-200 p-3 bg-gray-50/50">
            <label class="text-sm font-bold text-text-main">Convocatoria PDF *</label>
            <input type="file" accept=".pdf" :disabled="!isEditingFiles" @change="setFile($event, 'convocatoriaPDF')" class="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            <p class="text-xs text-text-muted">{{ archivos.convocatoriaPDF?.name || 'Sin archivo' }}</p>
          </div>
          <div class="space-y-2 rounded-xl border border-gray-200 p-3 bg-gray-50/50">
            <label class="text-sm font-bold text-text-main">Reglamento PDF *</label>
            <input type="file" accept=".pdf" :disabled="!isEditingFiles" @change="setFile($event, 'reglamentoPDF')" class="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            <p class="text-xs text-text-muted">{{ archivos.reglamentoPDF?.name || 'Sin archivo' }}</p>
          </div>
          <div class="space-y-2 rounded-xl border border-gray-200 p-3 bg-gray-50/50">
            <label class="text-sm font-bold text-text-main">Afiche JPG/PNG *</label>
            <input type="file" accept=".jpg,.jpeg,.png" :disabled="!isEditingFiles" @change="setFile($event, 'aficheJPG')" class="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            <p class="text-xs text-text-muted">{{ archivos.aficheJPG?.name || 'Sin archivo' }}</p>
          </div>
        </div>

        <div v-if="isEditingFiles" class="flex justify-end">
          <Button @click="isEditingFiles = false" class="flex items-center gap-2"><Save class="h-4 w-4" />Guardar Documentos</Button>
        </div>
      </CardContent>
    </Card>

      </main>
    </div>

    <div v-if="isCategoriaModalOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-2xl border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Nueva Categoría</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-bold text-text-main">Letra griega</label>
            <GreekLetterPicker v-model="nuevaCategoria.nombre" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Curso</label>
              <select v-model="nuevaCategoria.curso" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="" disabled>Selecciona un curso</option>
                <option v-for="curso in cursosDisponibles" :key="curso" :value="curso">{{ curso }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Grado</label>
              <select v-model="nuevaCategoria.grado" disabled class="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-text-muted transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="SECUNDARIA">SECUNDARIA</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <Button variant="outline" @click="isCategoriaModalOpen = false">Cancelar</Button>
            <Button @click="createCategoria" class="flex items-center gap-2"><Plus class="h-4 w-4" />Crear Categoría</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
