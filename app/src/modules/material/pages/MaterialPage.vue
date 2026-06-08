<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { BookOpen, Download, FileText, Filter, PlayCircle, Search } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { usePublicStore } from '@/modules/public/stores/public.store'
import type { TipoMaterialEnum } from '@/modules/public/types/public.api'

type TipoUi = 'Videos' | 'Practicas' | 'Apuntes' | 'Examenes' | 'Solucionarios' | 'Otros'

const publicStore = usePublicStore()
const searchTerm = ref('')
const tipoFiltro = ref<string>('Todos')
const currentPage = ref(1)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const tiposDisponibles = ['Todos', 'Videos', 'Practicas', 'Apuntes', 'Examenes', 'Solucionarios', 'Otros']

const tipoApi = computed<TipoMaterialEnum | null>(() => {
  const map: Record<string, TipoMaterialEnum> = {
    Videos: 'VIDEO_EXTERNO',
    Practicas: 'EJERCICIOS',
    Apuntes: 'DOCUMENTO',
    Examenes: 'EXAMEN',
    Solucionarios: 'SOLUCIONARIO',
    Otros: 'OTRO',
  }
  return tipoFiltro.value === 'Todos' ? null : map[tipoFiltro.value] ?? null
})

const tipoUi = (tipo: TipoMaterialEnum | null): TipoUi => {
  if (tipo === 'VIDEO_EXTERNO') return 'Videos'
  if (tipo === 'EJERCICIOS') return 'Practicas'
  if (tipo === 'EXAMEN') return 'Examenes'
  if (tipo === 'SOLUCIONARIO') return 'Solucionarios'
  if (tipo === 'DOCUMENTO') return 'Apuntes'
  return 'Otros'
}

const getTipoConfig = (tipo: TipoUi) => {
  switch (tipo) {
    case 'Videos': return { color: 'bg-red-100 text-danger border-danger/20', icon: PlayCircle }
    case 'Practicas': return { color: 'bg-warning/20 text-warning border-warning/20', icon: FileText }
    case 'Examenes': return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FileText }
    case 'Solucionarios': return { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FileText }
    case 'Apuntes': return { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: BookOpen }
    default: return { color: 'bg-gray-100 text-text-main border-gray-200', icon: FileText }
  }
}

const materiales = computed(() => publicStore.materiales.map((mat, index) => ({
  id: `${mat.enlace_acceso}-${index}`,
  nombre: mat.nombre_material,
  descripcion: mat.descripcion ?? '',
  tipo: tipoUi(tipoApi.value),
  url: mat.enlace_acceso,
})))

const loadMateriales = async (reset = false) => {
  if (reset) currentPage.value = 1
  await publicStore.fetchMateriales({
    page: currentPage.value,
    limit: 20,
    tipo_material: tipoApi.value,
    busqueda: searchTerm.value || null,
  }, !reset)
}

const loadMore = async () => {
  if (publicStore.loading || !publicStore.metaMateriales || currentPage.value >= publicStore.metaMateriales.total_pages) return
  currentPage.value += 1
  await loadMateriales(false)
}

let filterTimer: ReturnType<typeof setTimeout> | null = null
watch([searchTerm, tipoFiltro], () => {
  if (filterTimer) clearTimeout(filterTimer)
  filterTimer = setTimeout(() => void loadMateriales(true), 350)
})

onMounted(async () => {
  await loadMateriales(true)
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) void loadMore()
  }, { rootMargin: '180px' })
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="w-full bg-gray-50 min-h-screen pb-20">
    <div class="bg-primary text-white pt-12 pb-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-slate-900/40 to-transparent" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <BookOpen class="w-16 h-16 mx-auto mb-6 opacity-90" />
        <h1 class="text-4xl md:text-5xl font-heading font-black mb-4">Material Academico</h1>
        <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
          Repositorio de recursos, guias, practicas y documentos para tu preparacion.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
      <Card class="rounded-2xl shadow-sm border-gray-200 p-6 mb-10">
        <CardContent class="p-0 flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full">
            <Search class="h-5 w-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input v-model="searchTerm" type="text" class="w-full pl-10 pr-3 py-3 border-gray-300 rounded-xl bg-white focus-visible:ring-primary sm:text-sm h-12.5" placeholder="Buscar material..." />
          </div>
          <div class="relative w-full sm:w-56 bg-white border border-gray-300 rounded-xl overflow-hidden h-12.5 flex items-center pl-3">
            <Filter class="h-4 w-4 text-text-muted shrink-0 z-10" />
            <select v-model="tipoFiltro" class="border-0 bg-transparent shadow-none focus:ring-0 h-full w-full pl-2">
              <option v-for="t in tiposDisponibles" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div v-if="materiales.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card v-for="mat in materiales" :key="mat.id" class="rounded-2xl shadow-sm hover:shadow-md border-gray-100 overflow-hidden transition-all flex flex-col group h-full">
          <CardContent class="p-6 flex-1 flex flex-col">
            <Badge variant="outline" :class="`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border w-fit mb-4 ${getTipoConfig(mat.tipo).color}`">
              <component :is="getTipoConfig(mat.tipo).icon" class="w-3.5 h-3.5" />
              {{ mat.tipo }}
            </Badge>
            <h3 class="font-heading font-bold text-text-main text-lg mb-2 leading-tight group-hover:text-primary transition-colors">{{ mat.nombre }}</h3>
            <p class="text-sm text-text-muted mb-4 flex-1">{{ mat.descripcion }}</p>
          </CardContent>
          <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
            <Button as="a" :href="mat.url" target="_blank" rel="noreferrer" variant="outline" class="w-full inline-flex items-center justify-center gap-2 bg-white text-primary border-gray-200 hover:border-primary py-5 rounded-lg text-sm font-semibold h-auto">
              <Download class="w-4 h-4" /> Descargar / Ver
            </Button>
          </div>
        </Card>
      </div>

      <Card v-else-if="!publicStore.loading" class="text-center py-20 border-gray-200 border-dashed rounded-2xl">
        <CardContent class="p-0 flex flex-col items-center">
          <BookOpen class="w-12 h-12 text-gray-300 mb-4" />
          <h3 class="text-lg font-heading font-bold text-text-main mb-1">No se encontraron materiales</h3>
          <p class="text-text-muted">Prueba ajustando los filtros.</p>
        </CardContent>
      </Card>

      <div ref="sentinel" class="h-16 flex items-center justify-center text-sm text-text-muted">
        <span v-if="publicStore.loading">Cargando...</span>
      </div>
    </div>
  </div>
</template>
