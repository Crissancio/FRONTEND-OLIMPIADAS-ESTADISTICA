<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { 
  BookOpen, Download, Search, Filter, Calendar, X,
  FileQuestion, BookOpenCheck, Calculator, Megaphone, 
  Scale, ScrollText, FileText, FileArchive, Link, 
  Globe, ExternalLink, Youtube 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { useMaterialStore } from '@/modules/material/stores/material.store'
import type { TipoMaterialEnum, GetMaterialesPublicParams } from '@/modules/public/types/public.api'

interface DateRange {
  start: Date | null
  end: Date | null
}

const materialStore = useMaterialStore()
const searchTerm = ref('')
const tipoFiltro = ref<string>('Todos')
const currentPage = ref(1)
const showDatePicker = ref(false)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const dateRange = ref<DateRange>({
  start: null,
  end: null
})

const tiposDisponibles = [
  { value: 'Todos', label: 'Todos los recursos' },
  { value: 'EXAMEN', label: 'Exámenes' },
  { value: 'SOLUCIONARIO', label: 'Solucionarios' },
  { value: 'EJERCICIOS', label: 'Prácticas' },
  { value: 'DOCUMENTO', label: 'Apuntes' },
  { value: 'CONVOCATORIA', label: 'Convocatorias' },
  { value: 'REGLAMENTO', label: 'Reglamentos' },
  { value: 'AFICHE', label: 'Afiches' },
  { value: 'DOCUMENTO_EXTERNO', label: 'Documentos Externos' },
  { value: 'ARCHIVO_EXTERNO', label: 'Archivos Externos' },
  { value: 'PAGINA_EXTERNA', label: 'Páginas Externas' },
  { value: 'VIDEO_EXTERNO', label: 'Videos Externos' },
  { value: 'OTRO', label: 'Otros Recursos' }
]

const materialConfig: Record<TipoMaterialEnum, { label: string; group: string; icon: any }> = {
  EXAMEN: { label: 'Examen', group: 'academico', icon: FileQuestion },
  SOLUCIONARIO: { label: 'Solucionario', group: 'academico', icon: BookOpenCheck },
  EJERCICIOS: { label: 'Práctica', group: 'academico', icon: Calculator },
  CONVOCATORIA: { label: 'Convocatoria', group: 'institucional', icon: Megaphone },
  REGLAMENTO: { label: 'Reglamento', group: 'institucional', icon: Scale },
  AFICHE: { label: 'Afiche', group: 'institucional', icon: ScrollText },
  DOCUMENTO: { label: 'Documento', group: 'documento', icon: FileText },
  OTRO: { label: 'Otro', group: 'documento', icon: FileArchive },
  DOCUMENTO_EXTERNO: { label: 'Doc. Externo', group: 'externo', icon: Link },
  ARCHIVO_EXTERNO: { label: 'Archivo Ext.', group: 'externo', icon: Globe },
  PAGINA_EXTERNA: { label: 'Pág. Externa', group: 'externo', icon: ExternalLink },
  VIDEO_EXTERNO: { label: 'Video Externo', group: 'externo', icon: Youtube }
}

const getGroupStyles = (group: string) => {
  return {
    color: `var(--color-material-${group}-text)`,
    backgroundColor: `var(--color-material-${group}-soft)`,
    borderColor: `var(--color-material-${group}-border)`
  }
}

const dateLabel = computed(() => {
  if (dateRange.value.start && dateRange.value.end) {
    const s = new Date(dateRange.value.start).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
    const e = new Date(dateRange.value.end).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
    return `${s} - ${e}`
  }
  return 'Filtrar por fecha'
})

const getFormattedParamDate = (date: Date | null) => {
  if (!date) return null
  return new Date(date).toISOString().split('T')[0]
}

const loadMateriales = async (reset = false) => {
  if (reset) {
    currentPage.value = 1
  }
  
  const params: GetMaterialesPublicParams = {
    page: currentPage.value,
    limit: 16,
    tipo_material: tipoFiltro.value === 'Todos' ? null : (tipoFiltro.value as TipoMaterialEnum),
    busqueda: searchTerm.value.trim() || null,
    fecha_start: getFormattedParamDate(dateRange.value.start),
    fecha_end: getFormattedParamDate(dateRange.value.end)
  }

  await materialStore.fetchMateriales(params, !reset)
}

const loadMore = async () => {
  if (materialStore.loading || currentPage.value >= materialStore.totalPages) return
  currentPage.value += 1
  await loadMateriales(false)
}

const clearDates = () => {
  dateRange.value = { start: null, end: null }
  showDatePicker.value = false
}

let filterTimer: ReturnType<typeof setTimeout> | null = null
watch([searchTerm, tipoFiltro, dateRange], () => {
  if (filterTimer) clearTimeout(filterTimer)
  filterTimer = setTimeout(() => void loadMateriales(true), 350)
})

onMounted(async () => {
  materialStore.resetStore()
  await loadMateriales(true)
  
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) void loadMore()
  }, { rootMargin: '150px' })
  
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="w-full bg-gray-50 min-h-screen pb-20">
    <div class="bg-primary-dark text-white pt-12 pb-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-slate-900/40 to-transparent" />
          <div 
      class="absolute inset-0 opacity-15 z-0" 
      style="background-image: url('data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' font-family=\'serif\' font-size=\'24\' font-style=\'italic\' font-weight=\'bold\'%3E%3Ctext x=\'20\' y=\'30\'%3EΣ%3C/text%3E%3Ctext x=\'70\' y=\'45\'%3Eμ%3C/text%3E%3Ctext x=\'40\' y=\'80\'%3Eσ%3C/text%3E%3Ctext x=\'95\' y=\'90\'%3Eπ%3C/text%3E%3Ctext x=\'15\' y=\'105\'%3EΔ%3C/text%3E%3Ctext x=\'60\' y=\'115\'%3E∫%3C/text%3E%3Ctext x=\'100\' y=\'25\'%3Eα%3C/text%3E%3C/g%3E%3C/svg%3E'); background-size: 120px 120px;"
    />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <BookOpen class="w-16 h-16 mx-auto mb-6 opacity-90" />
        <h1 class="text-4xl md:text-5xl font-heading font-black mb-4">Material Académico</h1>
        <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
          Repositorio unificado de recursos, guías, prácticas y documentos para fortalecer tu preparación.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-30">
      <Card class="rounded-2xl shadow-sm border-gray-200 p-6 mb-10 bg-white overflow-visible!">
        <CardContent class="p-0 flex flex-col lg:flex-row gap-4 items-center overflow-visible!">
          <div class="relative flex-1 w-full">
            <Search class="h-5 w-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchTerm" 
              type="text" 
              class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white focus-visible:ring-primary text-sm h-12.5" 
              placeholder="Buscar por título o descripción..." 
            />
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 overflow-visible!">
            <div class="relative w-full sm:w-60 bg-white border border-gray-300 rounded-xl overflow-hidden h-12.5 flex items-center pl-3">
              <Filter class="h-4 w-4 text-text-muted shrink-0 z-10" />
              <select v-model="tipoFiltro" class="border-0 bg-transparent shadow-none focus:ring-0 h-full w-full pl-2 text-sm text-text-main cursor-pointer">
                <option v-for="t in tiposDisponibles" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>

            <div class="relative w-full sm:w-64">
              <button 
                @click="showDatePicker = !showDatePicker" 
                type="button" 
                class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm h-12.5 w-full text-left justify-between"
              >
                <span class="flex items-center gap-2 text-text-main truncate">
                  <Calendar class="h-4 w-4 text-text-muted shrink-0" />
                  {{ dateLabel }}
                </span>
                <X 
                  v-if="dateRange.start || dateRange.end" 
                  class="w-4 h-4 text-text-muted hover:text-danger shrink-0" 
                  @click.stop="clearDates" 
                />
              </button>
              
              <div v-if="showDatePicker" class="absolute right-0 top-full mt-2 z-50 bg-white shadow-2xl rounded-xl p-2 border border-gray-200 min-w-70">
                <VDatePicker 
                  v-model.range="dateRange" 
                  :columns="1" 
                  is-expanded 
                  @update:model-value="showDatePicker = false"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div v-if="materialStore.error" class="py-16 text-center text-danger font-medium">
        {{ materialStore.error }}
      </div>

      <div v-else-if="materialStore.items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        <Card 
          v-for="(mat, idx) in materialStore.items" 
          :key="`material-${idx}`" 
          class="rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all flex flex-col group h-full bg-white"
        >
          <CardContent class="p-6 flex-1 flex flex-col">
            <template v-if="(mat as any).tipo_material && materialConfig[(mat as any).tipo_material as TipoMaterialEnum]">
              <Badge 
                variant="outline" 
                class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border w-fit mb-4 rounded-md"
                :style="getGroupStyles(materialConfig[(mat as any).tipo_material as TipoMaterialEnum].group)"
              >
                <component :is="materialConfig[(mat as any).tipo_material as TipoMaterialEnum].icon" class="w-3.5 h-3.5" />
                {{ materialConfig[(mat as any).tipo_material as TipoMaterialEnum].label }}
              </Badge>
            </template>
            <template v-else>
              <Badge 
                variant="outline" 
                class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border w-fit mb-4 rounded-md"
                :style="getGroupStyles('documento')"
              >
                <FileText class="w-3.5 h-3.5" />
                Recurso Digital
              </Badge>
            </template>

            <h3 class="font-heading font-bold text-text-main text-base mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {{ mat.nombre_material }}
            </h3>
            
            <p v-if="mat.descripcion" class="text-sm text-text-muted mb-4 line-clamp-3">
              {{ mat.descripcion }}
            </p>
            
            <p v-if="mat.fecha_publicacion" class="text-xs text-text-muted mt-auto pt-2 flex items-center gap-1">
              <Calendar class="w-3 h-3" /> Publicado el {{ new Date(mat.fecha_publicacion).toLocaleDateString('es-BO') }}
            </p>
          </CardContent>
          
          <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
            <Button 
              as="a" 
              :href="mat.enlace_acceso" 
              target="_blank" 
              rel="noreferrer" 
              variant="outline" 
              class="w-full inline-flex items-center justify-center gap-2 bg-white text-primary border-gray-200 hover:border-primary py-5 rounded-lg text-sm font-semibold h-auto shadow-none"
            >
              <Download class="w-4 h-4" /> Descargar / Ver
            </Button>
          </div>
        </Card>
      </div>

      <Card v-else-if="!materialStore.loading" class="text-center py-20 border-gray-200 border-dashed rounded-2xl bg-white">
        <CardContent class="p-0 flex flex-col items-center">
          <BookOpen class="w-12 h-12 text-gray-300 mb-4" />
          <h3 class="text-lg font-heading font-bold text-text-main mb-1">No se encontraron materiales</h3>
          <p class="text-text-muted text-sm">Prueba ajustando los criterios de los filtros de búsqueda.</p>
        </CardContent>
      </Card>

      <div ref="sentinel" class="h-16 flex items-center justify-center text-sm text-text-muted w-full mt-6">
        <span v-if="materialStore.loading" class="font-medium animate-pulse">Cargando recursos disponibles...</span>
      </div>
    </div>
  </div>
</template>