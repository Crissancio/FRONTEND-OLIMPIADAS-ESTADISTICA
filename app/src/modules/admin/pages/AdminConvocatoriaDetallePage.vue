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
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { useConvocatoria } from '@/modules/admin/composables/useConvocatorias'

type TabKey = 'general' | 'categorias' | 'inscritos' | 'configuracion'

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
    if (tab === 'general' || tab === 'categorias' || tab === 'inscritos' || tab === 'configuracion') {
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

watch(
  convocatoria,
  (value) => {
    if (!value) return
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

const archivos = ref<{ convocatoriaPDF: File | null; reglamentoPDF: File | null; aficheJPG: File | null }>({
  convocatoriaPDF: null,
  reglamentoPDF: null,
  aficheJPG: null,
})

const fileReady = computed(() => Boolean(archivos.value.convocatoriaPDF && archivos.value.reglamentoPDF && archivos.value.aficheJPG))

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
    categorias: localConvocatoria.value.categorias,
    fases: localConvocatoria.value.fases,
  })
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

  <div v-else class="space-y-6">
    
    <header class="sticky top-0 z-20 rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="router.push('/admin/convocatorias')"><ArrowLeft class="h-4 w-4" />Volver</Button>
          <div>
            <h1 class="font-heading text-xl font-bold text-text-main">{{ localConvocatoria.nombre }}</h1>
            <div class="mt-1 flex items-center gap-2 text-sm text-text-muted">
              <span>Gestión {{ localConvocatoria.gestion }}</span>
              <Badge variant="outline" :class="`border px-2 py-0.5 ${statusClass(localConvocatoria.estado)}`">{{ localConvocatoria.estado }}</Badge>
            </div>
          </div>
        </div>
        <Button v-if="localConvocatoria.estado === 'Borrador'" class="bg-success text-white hover:bg-emerald-600 flex items-center gap-2" @click="publish">
          <CheckCheck class="h-4 w-4" />
          TODO LISTO?
        </Button>
      </div>
    </header>
    
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-2.5"><Users class="h-5 w-5 text-primary" /></div>
            <div><p class="text-xl font-bold text-text-main">{{ convocatoria.inscritos }}</p><p class="text-xs text-text-muted">Inscritos</p></div>
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-info/10 p-2.5"><BookOpen class="h-5 w-5 text-info" /></div>
            <div><p class="text-xl font-bold text-text-main">{{ convocatoria.categorias }}</p><p class="text-xs text-text-muted">Categorías</p></div>
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-secondary/10 p-2.5"><BarChart3 class="h-5 w-5 text-secondary" /></div>
            <div><p class="text-xl font-bold text-text-main">{{ convocatoria.fases }}</p><p class="text-xs text-text-muted">Fases</p></div>
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-accent/10 p-2.5"><Trophy class="h-5 w-5 text-accent" /></div>
            <div><p class="text-xl font-bold text-text-main">0</p><p class="text-xs text-text-muted">Ganadores</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div v-if="localConvocatoria.estado === 'Borrador'" class="rounded-xl border border-warning/20 bg-warning/10 p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p class="text-sm font-medium text-warning">Convocatoria en borrador. Completa categorías, configuración y documentos.</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'general' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'general'">Información General</button>
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'categorias' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'categorias'">Categorías</button>
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'inscritos' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'inscritos'">Estudiantes Inscritos</button>
      <button class="rounded-md px-3 py-2 text-sm font-semibold transition-colors" :class="activeTab === 'configuracion' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'" @click="activeTab = 'configuracion'">Configuración</button>
    </div>

    <Card v-if="activeTab === 'general'" class="border-gray-200 shadow-soft bg-white">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2"><Settings class="h-5 w-5 text-primary" />Datos de la convocatoria</CardTitle>
          <div class="flex gap-2">
            <Button v-if="!isEditingData" variant="outline" @click="isEditingData = true" class="flex items-center gap-2"><Edit class="h-4 w-4" />Editar Información</Button>
            <template v-else>
              <Button variant="outline" @click="isEditingData = false" class="flex items-center gap-2"><X class="h-4 w-4" />Cancelar</Button>
              <Button @click="saveData" class="flex items-center gap-2"><Save class="h-4 w-4" />Guardar Cambios</Button>
            </template>
          </div>
        </div>
      </CardHeader>
      <CardContent class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div><label class="mb-1 block text-sm font-bold text-text-main">Nombre</label><input v-model="localConvocatoria.nombre" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted" /></div>
        <div><label class="mb-1 block text-sm font-bold text-text-main">Gestión</label><input v-model="localConvocatoria.gestion" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted" /></div>
        <div><label class="mb-1 block text-sm font-bold text-text-main">Inicio Olimpiadas</label><input v-model="localConvocatoria.inicioOlimpiada" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted" /></div>
        <div><label class="mb-1 block text-sm font-bold text-text-main">Fin Olimpiadas</label><input v-model="localConvocatoria.finOlimpiada" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted" /></div>
        <div><label class="mb-1 block text-sm font-bold text-text-main">Inicio Inscripción</label><input v-model="localConvocatoria.inicioInscripcion" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted" /></div>
        <div><label class="mb-1 block text-sm font-bold text-text-main">Fin Inscripción</label><input v-model="localConvocatoria.finInscripcion" :disabled="!isEditingData" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted" /></div>
        <div class="md:col-span-2"><label class="mb-1 block text-sm font-bold text-text-main">Descripción</label><textarea v-model="localConvocatoria.descripcion" :disabled="!isEditingData" class="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-50 disabled:text-text-muted"></textarea></div>
      </CardContent>
    </Card>

    <Card v-if="activeTab === 'categorias'" class="border-gray-200 shadow-soft bg-white">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2"><BookOpen class="h-5 w-5 text-primary" />Categorías</CardTitle>
          <Button @click="isCategoriaModalOpen = true" class="flex items-center gap-2"><Plus class="h-4 w-4" />Nueva Categoría</Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-for="item in categorias" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-2"><BookOpen class="h-5 w-5 text-primary" /></div>
            <div>
              <p class="font-bold text-text-main">{{ item.nombre }}</p>
              <div class="mt-1 flex items-center gap-2">
                <Badge variant="outline" class="border-info/20 bg-info/10 text-info px-2 py-0.5">{{ item.curso }}</Badge>
                <Badge variant="outline" class="border-secondary/20 bg-secondary/10 text-secondary px-2 py-0.5">{{ item.grado }}</Badge>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" @click="router.push(`/admin/convocatoria/${convocatoriaId}/categoria/${item.id}/gestionar`)" class="flex items-center gap-1.5"><Eye class="h-4 w-4" />Gestionar</Button>
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

    <Card v-if="activeTab === 'configuracion'" class="border-gray-200 shadow-soft bg-white">
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

    <div v-if="isCategoriaModalOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-md border-gray-200">
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
