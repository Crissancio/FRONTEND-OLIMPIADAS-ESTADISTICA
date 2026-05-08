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
import ConvocatoriaDetailTabs from '@/modules/admin/components/ConvocatoriaDetailTabs.vue'
import MaterialCard from '@/modules/admin/components/MaterialCard.vue'
import { useConvocatoria } from '@/modules/admin/composables/useConvocatorias'
import { adminMaterialesMock, type AdminConvocatoria } from '@/modules/admin/data/admin.data'

type TabKey = 'general' | 'categorias' | 'inscritos' | 'material' | 'configuracion'

interface CategoriaRow {
  id: string
  nombre: string
  curso: string
  grado: string
}

const route = useRoute()
const router = useRouter()

const convocatoriaId = typeof route.params.convocatoriaId === 'string' ? route.params.convocatoriaId : ''
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

const categorias = ref<CategoriaRow[]>([
  { id: 'cat-rho-001', nombre: 'RHO', curso: '5', grado: 'SECUNDARIA' },
  { id: 'cat-delta-001', nombre: 'DELTA', curso: '6', grado: 'SECUNDARIA' },
])

const isCategoriaModalOpen = ref(false)
const nuevaCategoria = ref({ nombre: '', curso: '', grado: 'SECUNDARIA' })

const createCategoria = () => {
  if (!nuevaCategoria.value.nombre.trim() || !nuevaCategoria.value.curso.trim()) return
  categorias.value.push({
    id: `cat-${Date.now()}`,
    nombre: nuevaCategoria.value.nombre,
    curso: nuevaCategoria.value.curso,
    grado: nuevaCategoria.value.grado,
  })
  localConvocatoria.value.categorias = categorias.value.length
  nuevaCategoria.value = { nombre: '', curso: '', grado: 'SECUNDARIA' }
  isCategoriaModalOpen.value = false
}

const removeCategoria = (id: string) => {
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

const materialesConvocatoria = computed(() => adminMaterialesMock.filter((item) => item.convocatoriaId === convocatoriaId))

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
      <CardContent class="py-14 text-center">
        <Users class="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p class="font-bold text-text-main">Lista de Estudiantes Inscritos</p>
        <p class="text-sm text-text-muted mt-1">Sin inscritos para esta convocatoria.</p>
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

      <div v-if="materialesConvocatoria.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
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

    <Card v-if="activeTab === 'configuracion'" class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
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
      <CardContent class="space-y-5">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
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
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Inicio Olimpiada</label>
            <input v-model="localConvocatoria.inicioOlimpiada" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Fin Olimpiada</label>
            <input v-model="localConvocatoria.finOlimpiada" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Inicio Inscripción</label>
            <input v-model="localConvocatoria.inicioInscripcion" type="date" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Fin Inscripción</label>
            <input v-model="localConvocatoria.finInscripcion" type="date" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
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
      <Card class="w-full max-w-md border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Nueva Categoría</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div><label class="mb-1 block text-sm font-bold text-text-main">Nombre</label><input v-model="nuevaCategoria.nombre" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
          <div><label class="mb-1 block text-sm font-bold text-text-main">Curso</label><input v-model="nuevaCategoria.curso" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
          <div><label class="mb-1 block text-sm font-bold text-text-main">Grado</label><input v-model="nuevaCategoria.grado" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" /></div>
          <div class="flex justify-end gap-2 mt-6">
            <Button variant="outline" @click="isCategoriaModalOpen = false">Cancelar</Button>
            <Button @click="createCategoria" class="flex items-center gap-2"><Plus class="h-4 w-4" />Crear Categoría</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
