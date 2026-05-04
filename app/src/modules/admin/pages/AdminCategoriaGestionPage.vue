<script setup lang="ts">
import { computed, ref } from 'vue'
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
  Check,
  XCircle,
  Search,
  BookOpen,
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

type CategoriaTab = 'fases' | 'estudiantes' | 'resultados'

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
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  fechaInscripcion: string
}

const route = useRoute()
const router = useRouter()

const convocatoriaId = typeof route.params.convocatoriaId === 'string' ? route.params.convocatoriaId : ''
const categoriaId = typeof route.params.categoriaId === 'string' ? route.params.categoriaId : ''

const categoria = computed(() => {
  if (categoriaId.includes('rho')) return { nombre: 'RHO', curso: '5', grado: 'SECUNDARIA' }
  if (categoriaId.includes('delta')) return { nombre: 'DELTA', curso: '6', grado: 'SECUNDARIA' }
  return { nombre: 'Categoría', curso: '5', grado: 'SECUNDARIA' }
})

const activeTab = ref<CategoriaTab>('fases')

const fases = ref<FaseItem[]>([
  {
    id: 'fase-001',
    nombre: 'Fase Clasificatoria',
    inicio: '2026-10-01',
    fin: '2026-10-15',
    descripcion: 'Primera fase de clasificación para participantes.',
    tipo: 'prueba',
    modalidad: 'virtual',
    materiales: [
      { id: 'mat-001', nombre: 'Temario Fase Clasificatoria', tipo: 'temario' },
      { id: 'mat-002', nombre: 'Ejercicios de Práctica', tipo: 'ejercicios' },
    ],
  },
  {
    id: 'fase-002',
    nombre: 'Preparación',
    inicio: '2026-09-01',
    fin: '2026-09-30',
    descripcion: 'Fase de nivelación y práctica guiada.',
    tipo: 'preparacion',
    modalidad: 'semipresencial',
    materiales: [{ id: 'mat-003', nombre: 'Video Introductorio', tipo: 'video' }],
  },
])

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
})

const openCreateFase = () => {
  editingFaseId.value = null
  faseForm.value = { nombre: '', inicio: '', fin: '', descripcion: '', tipo: 'preparacion', modalidad: 'virtual' }
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
  }
  isFaseModalOpen.value = true
}

const saveFase = () => {
  if (!faseForm.value.nombre || !faseForm.value.inicio || !faseForm.value.fin) return

  if (!editingFaseId.value) {
    fases.value = [
      {
        id: `fase-${Date.now()}`,
        nombre: faseForm.value.nombre,
        inicio: faseForm.value.inicio,
        fin: faseForm.value.fin,
        descripcion: faseForm.value.descripcion,
        tipo: faseForm.value.tipo,
        modalidad: faseForm.value.modalidad,
        materiales: [],
      },
      ...fases.value,
    ]
  } else {
    fases.value = fases.value.map((item) => {
      if (item.id !== editingFaseId.value) return item
      return {
        ...item,
        nombre: faseForm.value.nombre,
        inicio: faseForm.value.inicio,
        fin: faseForm.value.fin,
        descripcion: faseForm.value.descripcion,
        tipo: faseForm.value.tipo,
        modalidad: faseForm.value.modalidad,
      }
    })
  }
  isFaseModalOpen.value = false
}

const removeFase = (id: string) => {
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

const estudiantes = ref<EstudianteItem[]>([
  {
    id: 'est-001',
    nombres: 'Carlos',
    apellidos: 'Mamani Quispe',
    carnet: '13458976',
    email: 'carlos.mamani@ejemplo.com',
    telefono: '78945612',
    colegio: 'Colegio Franz Tamayo',
    curso: '5 Secundaria',
    estado: 'pendiente',
    fechaInscripcion: '2026-04-10',
  },
  {
    id: 'est-002',
    nombres: 'María',
    apellidos: 'López García',
    carnet: '14567823',
    email: 'maria.lopez@ejemplo.com',
    telefono: '76543210',
    colegio: 'Colegio Ayacucho',
    curso: '5 Secundaria',
    estado: 'pendiente',
    fechaInscripcion: '2026-04-12',
  },
])

const searchStudent = ref('')
const filteredStudents = computed(() => {
  if (!searchStudent.value.trim()) return estudiantes.value
  const term = searchStudent.value.toLowerCase()
  return estudiantes.value.filter((item) => {
    return (
      item.nombres.toLowerCase().includes(term) ||
      item.apellidos.toLowerCase().includes(term) ||
      item.carnet.includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.colegio.toLowerCase().includes(term)
    )
  })
})

const approveStudent = (id: string) => {
  estudiantes.value = estudiantes.value.map((item) => (item.id === id ? { ...item, estado: 'aprobado' } : item))
}

const rejectStudent = (id: string) => {
  estudiantes.value = estudiantes.value.map((item) => (item.id === id ? { ...item, estado: 'rechazado' } : item))
}

const selectedStudent = ref<EstudianteItem | null>(null)
const isStudentModalOpen = ref(false)

const openStudentModal = (student: EstudianteItem) => {
  selectedStudent.value = student
  isStudentModalOpen.value = true
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
  <div class="space-y-6">
    <header class="rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="router.push(`/admin/convocatoria/${convocatoriaId}/gestionar?tab=categorias`)">
            <ArrowLeft class="h-4 w-4" />
            Volver a Categorías
          </Button>
          <div class="text-sm text-text-muted">
            <span>Gestión de Categoría</span>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-sm">
          <BookOpen class="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 class="font-heading text-2xl font-bold text-text-main">{{ categoria.nombre }}</h1>
          <div class="mt-1 flex items-center gap-2">
            <Badge variant="outline" class="border-info/20 bg-info/10 text-info">{{ categoria.curso }}</Badge>
            <Badge variant="outline" class="border-secondary/20 bg-secondary/10 text-secondary">{{ categoria.grado }}</Badge>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-wrap gap-2">
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'fases' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'fases'">
        <CalendarDays class="mr-2 inline h-4 w-4" />Fases
      </button>
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'estudiantes' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'estudiantes'">
        <Users class="mr-2 inline h-4 w-4" />Estudiantes
      </button>
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'resultados' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'resultados'">
        <Trophy class="mr-2 inline h-4 w-4" />Resultados
      </button>
    </div>

    <Card v-if="activeTab === 'fases'" class="border-gray-200 shadow-soft bg-white">
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
        <div v-for="fase in fases" :key="fase.id" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                <Button variant="outline" size="sm" @click="openMaterialModal(fase.id)" class="flex items-center gap-1.5"><Upload class="h-4 w-4" />Material</Button>
                <Button variant="outline" size="sm" @click="openEditFase(fase)" class="text-text-muted"><Edit class="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" class="text-error hover:bg-error/10" @click="removeFase(fase.id)"><Trash2 class="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div v-if="expanded.includes(fase.id)" class="border-t border-gray-200 bg-gray-50 p-4">
            <p class="text-sm text-text-muted">{{ fase.descripcion }}</p>
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

    <Card v-if="activeTab === 'estudiantes'" class="border-gray-200 shadow-soft bg-white">
      <CardHeader class="border-b border-gray-200">
        <CardTitle class="flex items-center gap-2"><Users class="h-5 w-5 text-primary" />Estudiantes Inscritos</CardTitle>
      </CardHeader>
      <CardContent class="p-6">
        <div class="mb-5 max-w-md">
          <div class="relative">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchStudent" class="h-11 w-full rounded-md border border-gray-300 px-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar por nombre, carnet, email o colegio..." />
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="student in filteredStudents" :key="student.id" class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                  {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-bold text-text-main">{{ student.nombres }} {{ student.apellidos }}</p>
                    <Badge variant="outline" :class="student.estado === 'pendiente' ? 'border-warning/20 bg-warning/10 text-warning' : student.estado === 'aprobado' ? 'border-success/20 bg-success/10 text-success' : 'border-gray-300 bg-gray-100 text-text-muted'">
                      {{ student.estado }}
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
                <Button variant="outline" size="sm" class="border-success/30 text-success hover:bg-success/10 flex items-center gap-1.5" @click="approveStudent(student.id)"><Check class="h-4 w-4" />Aprobar</Button>
                <Button variant="outline" size="sm" class="border-error/30 text-error hover:bg-error/10 flex items-center gap-1.5" @click="rejectStudent(student.id)"><XCircle class="h-4 w-4" />Rechazar</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'resultados'" class="border-gray-200 shadow-soft bg-white">
      <CardContent class="py-16 text-center">
        <Trophy class="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p class="font-bold text-text-main">Resultados y Clasificación</p>
        <p class="text-sm text-text-muted mt-1">Sección preparada para publicar resultados por fase.</p>
      </CardContent>
    </Card>

    <!-- Modals (Fase, Material, Estudiante) -->
    <div v-if="isFaseModalOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-2xl border-gray-200">
        <CardHeader><CardTitle>{{ editingFaseId ? 'Editar Fase' : 'Crear Nueva Fase' }}</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div><label class="mb-1 block text-sm font-bold text-text-main">Nombre *</label><input v-model="faseForm.nombre" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label class="mb-1 block text-sm font-bold text-text-main">Tipo *</label><select v-model="faseForm.tipo" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"><option value="preparacion">Preparación</option><option value="prueba">Prueba</option></select></div>
            <div><label class="mb-1 block text-sm font-bold text-text-main">Modalidad *</label><select v-model="faseForm.modalidad" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"><option value="virtual">Virtual</option><option value="presencial">Presencial</option><option value="semipresencial">Semipresencial</option></select></div>
            <div><label class="mb-1 block text-sm font-bold text-text-main">Fecha Inicio *</label><input v-model="faseForm.inicio" type="date" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
            <div><label class="mb-1 block text-sm font-bold text-text-main">Fecha Fin *</label><input v-model="faseForm.fin" type="date" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
          </div>
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
            <Button @click="saveMaterial" class="flex items-center gap-2"><Plus class="h-4 w-4" />Agregar Material</Button>
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
            <p class="text-sm text-text-main flex items-center"><BookOpen class="mr-2 h-4 w-4 text-text-muted" />{{ selectedStudent.curso }}</p>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <Button variant="outline" @click="isStudentModalOpen = false">Cerrar</Button>
            <Button class="bg-error text-white hover:bg-error-dark flex items-center gap-2" @click="rejectStudent(selectedStudent.id); isStudentModalOpen = false"><XCircle class="h-4 w-4" />Rechazar</Button>
            <Button class="bg-success text-white hover:bg-emerald-600 flex items-center gap-2" @click="approveStudent(selectedStudent.id); isStudentModalOpen = false"><Check class="h-4 w-4" />Aprobar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
