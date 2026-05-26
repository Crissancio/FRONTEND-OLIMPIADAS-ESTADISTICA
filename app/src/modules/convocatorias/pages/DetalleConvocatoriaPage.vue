<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { 
  FileText, Download, Calendar, Monitor, MapPin, ArrowRight, Trophy, Users, 
  ChevronDown, Video, Link as LinkIcon, File, AlertCircle, CheckCircle, BookOpen
} from 'lucide-vue-next'
import { PublicService } from '@/modules/public/services/public.service'
import { usePublicStore } from '@/modules/public/stores/public.store'
import type { CategoriaResumenDTO, ConvocatoriaDetalleDTO, FaseResponseDTO, MaterialResponseDTO } from '@/modules/public/types/public.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'

const route = useRoute()
const publicStore = usePublicStore()
const activeTab = ref(0)
const expandedPhases = ref<Record<string, boolean>>({})
const detalle = ref<ConvocatoriaDetalleDTO | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const fasesByCategoria = ref<Record<string, FaseResponseDTO[]>>({})
const materialesByFase = ref<Record<string, MaterialResponseDTO[]>>({})

type PublicDetalleFase = ReturnType<typeof mapFase>
type PublicDetalleCategoria = {
  id: string
  nombre: string
  fases: PublicDetalleFase[]
  recursos: { nombre: string; url: string }[]
}

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : ''
const formatRange = (start?: string | null, end?: string | null) => [formatDate(start), formatDate(end)].filter(Boolean).join(' - ')
const categoriaId = (cat: CategoriaResumenDTO, index: number) => String(cat.id_categoria ?? `${cat.curso}-${index}`)
const categoriaNombre = (cat: CategoriaResumenDTO) => cat.nombre_categoria ?? `${cat.curso} ${cat.nivel}`

const mapMaterial = (mat: MaterialResponseDTO) => ({
  id: String(mat.id_material),
  nombre: mat.nombre_material,
  url: mat.enlace_acceso,
  tipo: mat.tipo_material === 'VIDEO' ? 'Video' : mat.tipo_material === 'OTRO' ? 'Documento' : 'PDF',
  tamano: '',
})

const mapFase = (fase: FaseResponseDTO) => ({
  id: String(fase.id_fase),
  nombre: fase.nombre_fase,
  descripcion: fase.descripcion ?? 'Sin descripcion registrada.',
  tipo: fase.estado === 'LISTA' ? 'Prueba' : 'Preparación',
  subtipo: '',
  fechas: fase.estado,
  modalidad: fase.modalidad ? fase.modalidad.charAt(0) + fase.modalidad.slice(1).toLowerCase() : '',
  materiales: (materialesByFase.value[String(fase.id_fase)] ?? []).map(mapMaterial),
})

const conv = computed(() => {
  if (!detalle.value?.convocatoria) {
    return null
  }

  const dto = detalle.value.convocatoria
  return {
    id: String(dto.id_convocatoria),
    nombre: dto.nombre_convocatoria,
    gestion: dto.gestion,
    estado: dto.estado,
    descripcionBreve: dto.descripcion ?? '',
    descripcionCompleta: dto.descripcion ?? 'Sin descripcion registrada.',
    fechas: formatRange(dto.inicio_olimpiadas, dto.fin_olimpiadas) || formatRange(dto.fecha_inicio_inscripcion, dto.fecha_fin_inscripcion),
    categorias: detalle.value.categorias.map((cat, index) => {
      const id = categoriaId(cat, index)
      return {
        id,
        nombre: categoriaNombre(cat),
        fases: (cat.id_categoria ? fasesByCategoria.value[String(cat.id_categoria)] ?? [] : []).map(mapFase),
        recursos: [] as PublicDetalleCategoria['recursos'],
      }
    }),
    materialGeneral: detalle.value.materiales.map(mapMaterial),
  }
})

const activeCategory = computed(() => {
  if (!conv.value) return null
  return conv.value.categorias[activeTab.value] || null
})

const aficheUrl = computed(() => detalle.value?.afiche?.enlace_acceso ?? null)
const convocatoriaDocumentoUrl = computed(() => detalle.value?.convocatoria_documento?.enlace_acceso ?? null)
const reglamentoUrl = computed(() => detalle.value?.reglamento?.enlace_acceso ?? null)
const primaryVisualUrl = computed(() => aficheUrl.value ?? convocatoriaDocumentoUrl.value)
const primaryVisualLabel = computed(() => aficheUrl.value ? 'Afiche oficial' : convocatoriaDocumentoUrl.value ? 'Convocatoria oficial' : 'Sin afiche/convocatoria')
const showInscripcion = computed(() => conv.value?.estado === 'INSCRIPCION EN CURSO')

const loadDetalle = async () => {
  const id = Number(route.params.id)
  if (!Number.isFinite(id)) return
  isLoading.value = true
  loadError.value = null
  try {
    const data = await publicStore.loadDetalle(id)
    detalle.value = data

    const catsWithId = data.categorias.filter((cat) => cat.id_categoria != null)
    const faseEntries = await Promise.all(catsWithId.map(async (cat) => {
      const res = await PublicService.getFasesPorCategoria(cat.id_categoria as number)
      return [String(cat.id_categoria), res.data] as const
    }))
    fasesByCategoria.value = Object.fromEntries(faseEntries)

    const fases = faseEntries.flatMap(([, items]) => items)
    const materialEntries = await Promise.all(fases.map(async (fase) => {
      const res = await PublicService.getMaterialesPorFase(fase.id_fase)
      return [String(fase.id_fase), res.data] as const
    }))
    materialesByFase.value = Object.fromEntries(materialEntries)
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'No se pudo cargar la convocatoria.'
  } finally {
    isLoading.value = false
  }
}

const togglePhase = (phaseId: string) => {
  expandedPhases.value = {
    ...expandedPhases.value,
    [phaseId]: !expandedPhases.value[phaseId]
  }
}

onMounted(() => {
  void loadDetalle()
})
</script>

<template>
  <div class="bg-gray-50 w-full min-h-screen">
    <!-- Header Banner -->
    <div class="bg-slate-900 text-white pt-16 pb-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-primary opacity-20 mix-blend-multiply" />
      <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <router-link to="/convocatorias" class="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm font-semibold transition-colors mb-8 group">
          <ArrowRight class="w-4 h-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" />
          Volver a convocatorias
        </router-link>
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="max-w-3xl" v-if="conv">
            <div class="flex items-center gap-3 mb-6">
              <Badge 
                :variant="conv.estado === 'ACTIVA' ? 'default' : 'secondary'"
                :class="`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded border flex items-center gap-1.5 ${conv.estado === 'ACTIVA' ? 'bg-success/20 text-success border-success/20 hover:bg-success/20' : 'bg-gray-100 text-text-main border-gray-200 hover:bg-gray-100'}`"
              >
                <span v-if="conv.estado === 'ACTIVA'" class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {{ conv.estado }}
              </Badge>
              <Badge variant="outline" class="px-3 py-1 text-sm font-bold uppercase tracking-wider rounded border bg-info/10 text-info border-blue-200 hover:bg-info/10 flex items-center gap-1.5">
                <Calendar class="w-4 h-4" />
                Gestion {{ conv.gestion }}
              </Badge>
            </div>
            <h1 class="text-4xl md:text-5xl font-heading font-extrabold mb-4 leading-tight text-white drop-shadow-md">
              {{ conv.nombre }}
            </h1>
            <p class="text-xl text-blue-100/90 font-medium leading-relaxed max-w-2xl">
              {{ conv.descripcionBreve }}
            </p>
          </div>
          
          <div class="shrink-0 pt-4 md:pt-0" v-if="showInscripcion">
            <Button 
              as="router-link"
              to="/inscripcion"
              size="lg"
              class="inline-flex items-center gap-3 bg-accent hover:bg-accent/90 text-white px-8 py-6 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(184,77,53,0.4)] h-auto"
            >
              <Trophy class="w-6 h-6" />
              Inscríbete ahora
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20 pb-20">
      <template v-if="!conv">
        <div class="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
          <AlertCircle class="w-16 h-16 text-text-muted mb-6" />
          <h1 class="text-3xl font-heading font-bold text-text-main mb-4">{{ isLoading ? 'Cargando convocatoria' : 'Convocatoria no encontrada' }}</h1>
          <p class="text-lg text-text-muted mb-8 max-w-md text-center">{{ isLoading ? 'Consultando datos oficiales.' : 'La convocatoria que buscas no existe o ha sido eliminada del sistema.' }}</p>
          <Button 
            as="router-link"
            to="/convocatorias"
            size="lg"
            class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg font-semibold transition-all shadow-md h-auto"
          >
            <ArrowRight class="w-5 h-5 rotate-180" />
            Volver a Convocatorias
          </Button>
        </div>
      </template>

      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- General Info -->

            <!-- Categorías y Fases -->
            <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
              <div class="bg-gray-50 border-b border-gray-200 px-8 py-6">
                <h2 class="text-2xl font-heading font-bold text-text-main flex items-center gap-3">
                  <Users class="w-6 h-6 text-primary" />
                  Categorías Habilitadas
                </h2>
              </div>
              
              <div class="border-b border-gray-200 bg-white px-8">
                <div class="flex gap-8 overflow-x-auto pb-px scrollbar-hide">
                  <button
                    v-for="(cat, idx) in conv.categorias"
                    :key="cat.id"
                    @click="activeTab = idx"
                    class="flex items-center gap-2 py-4 px-2 font-semibold text-sm whitespace-nowrap transition-colors border-b-2"
                    :class="activeTab === idx ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'"
                  >
                    <CategorySymbol :name="cat.nombre" class="h-7 w-7 text-sm" />
                    {{ cat.nombre }}
                  </button>
                </div>
              </div>
              
              <CardContent class="p-8 sm:p-10 bg-white">
                <h3 class="text-xl font-heading font-bold text-text-main mb-8 flex items-center gap-2">
                  <Calendar class="w-5 h-5 text-text-muted" />
                  Cronograma de Fases
                </h3>
                
                <template v-if="activeCategory?.fases && activeCategory.fases.length > 0">
                  <div class="relative pl-8 border-l-2 border-gray-100 space-y-12">
                    <template v-for="fase in activeCategory.fases" :key="fase.id">
                      <div class="relative">
                        <div class="absolute -left-[41px] bg-white border-[3px] border-primary w-5 h-5 rounded-full mt-1.5 shadow-sm" />
                        <Card class="bg-gray-50 border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <CardContent class="p-0">
                            <div class="flex flex-wrap items-center gap-3 mb-3">
                              <Badge 
                                :variant="fase.tipo === 'Preparación' ? 'outline' : 'default'"
                                :class="`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${fase.tipo === 'Preparación' ? 'bg-warning/10 text-warning hover:bg-warning/10 border-warning/20' : 'bg-info/10 text-info hover:bg-info/10 border-blue-200'}`"
                              >
                                {{ fase.tipo }}{{ fase.subtipo ? ` - ${fase.subtipo}` : '' }}
                              </Badge>
                              <span class="text-sm font-semibold text-text-muted flex items-center gap-1.5">
                                <Calendar class="w-4 h-4" />
                                {{ fase.fechas }}
                              </span>
                            </div>
                            
                            <h4 class="text-xl font-heading font-bold text-text-main mb-3">{{ fase.nombre }}</h4>
                            <p class="text-text-muted mb-4 text-base">{{ fase.descripcion }}</p>
                            
                            <div v-if="fase.modalidad" class="flex items-center gap-2 text-sm font-medium text-text-main bg-white border border-gray-200 px-4 py-2 rounded-lg inline-flex shadow-sm mb-4">
                              <component :is="fase.modalidad === 'Virtual' ? Monitor : MapPin" class="w-4 h-4" :class="fase.modalidad === 'Virtual' ? 'text-info' : 'text-danger'" />
                              Modalidad {{ fase.modalidad }}
                            </div>

                             <div v-if="fase.materiales && fase.materiales.length > 0" class="mt-2 border-t border-gray-200 pt-4">
                                 <button
                                   @click="togglePhase(fase.id)"
                                   class="flex items-center justify-between w-full text-left text-sm font-bold text-text-main hover:text-primary transition-colors"
                                 >
                                   <span class="flex items-center gap-2">
                                     <BookOpen class="w-4 h-4" />
                                     Materiales de la Fase ({{ fase.materiales.length }})
                                   </span>
                                   <ChevronDown 
                                     class="w-4 h-4 transition-transform duration-200"
                                     :class="expandedPhases[fase.id] ? 'rotate-180' : ''"
                                   />
                                 </button>
                                 
                                 <div v-if="expandedPhases[fase.id]" class="mt-4 grid gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                   <a
                                     v-for="mat in fase.materiales"
                                     :key="mat.id"
                                     :href="mat.url"
                                     class="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-sm transition-all group"
                                   >
                                     <div class="flex items-center gap-3">
                                       <div 
                                         class="w-8 h-8 rounded-md flex items-center justify-center"
                                         :class="mat.tipo === 'PDF' ? 'bg-danger/10 text-danger' : mat.tipo === 'Video' ? 'bg-purple-50 text-purple-500' : mat.tipo === 'Documento' ? 'bg-info/10 text-info' : 'bg-gray-50 text-text-muted'"
                                       >
                                         <component 
                                           :is="mat.tipo === 'PDF' ? FileText : mat.tipo === 'Video' ? Video : mat.tipo === 'Documento' ? File : LinkIcon" 
                                           class="w-4 h-4" 
                                         />
                                       </div>
                                       <div>
                                         <p class="text-sm font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-1">{{ mat.nombre }}</p>
                                         <p class="text-xs text-text-muted flex gap-2">
                                           <span>{{ mat.tipo }}</span>
                                           <span v-if="mat.tamano">• {{ mat.tamano }}</span>
                                         </p>
                                       </div>
                                     </div>
                                     <Download class="w-4 h-4 text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                   </a>
                                 </div>
                               </div>
                          </CardContent>
                        </Card>
                      </div>
                    </template>
                  </div>
                </template>

                <Card v-else class="text-center py-12 bg-gray-50 border-dashed border-gray-200">
                  <CardContent class="p-0 flex flex-col items-center">
                    <Calendar class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p class="text-text-muted font-medium">No hay fases programadas para esta categoría.</p>
                  </CardContent>
                </Card>

                <!-- Recursos / Material -->
                <template v-if="activeCategory?.recursos && activeCategory.recursos.length > 0">
                  <div class="mt-12 pt-10 border-t border-gray-100">
                    <h3 class="text-xl font-heading font-bold text-text-main mb-6 flex items-center gap-2">
                      <BookOpen class="w-5 h-5 text-primary" />
                      Material de Estudio y Recursos
                    </h3>
                    <div class="grid sm:grid-cols-2 gap-4">
                      <a 
                        v-for="(rec, i) in activeCategory.recursos" 
                        :key="i" 
                        :href="rec.url" 
                        class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-primary hover:shadow-md transition-all group"
                      >
                        <div class="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Download class="w-5 h-5" />
                        </div>
                        <span class="font-semibold text-text-main group-hover:text-primary transition-colors">{{ rec.nombre }}</span>
                      </a>
                    </div>
                  </div>
                </template>
              </CardContent>
            </Card>

            <!-- Material de la Convocatoria General -->
            <template v-if="conv.materialGeneral && conv.materialGeneral.length > 0">
              <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
                <div class="bg-slate-50 border-b border-gray-200 px-8 py-6">
                  <h2 class="text-2xl font-heading font-bold text-text-main flex items-center gap-3">
                    <BookOpen class="w-6 h-6 text-primary" />
                    Material de la Convocatoria
                  </h2>
                </div>
                <CardContent class="p-8 sm:p-10 bg-white">
                  <p class="text-text-muted mb-6">
                    A continuación se presenta el material oficial y general para esta convocatoria.
                  </p>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <a
                      v-for="mat in conv.materialGeneral"
                      :key="mat.id"
                      :href="mat.url"
                      class="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div class="flex items-center gap-4">
                        <div 
                          class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                          :class="mat.tipo === 'PDF' ? 'bg-danger/10 text-danger group-hover:bg-red-500 group-hover:text-white' : mat.tipo === 'Video' ? 'bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white' : mat.tipo === 'Documento' ? 'bg-info/10 text-info group-hover:bg-primary group-hover:text-white' : 'bg-gray-50 text-text-muted group-hover:bg-gray-500 group-hover:text-white'"
                        >
                          <component 
                            :is="mat.tipo === 'PDF' ? FileText : mat.tipo === 'Video' ? Video : mat.tipo === 'Documento' ? File : LinkIcon" 
                            class="w-6 h-6" 
                          />
                        </div>
                        <div>
                          <p class="font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-1">{{ mat.nombre }}</p>
                          <p class="text-sm text-text-muted flex gap-2">
                            <span>{{ mat.tipo }}</span>
                            <span v-if="mat.tamano">• {{ mat.tamano }}</span>
                          </p>
                        </div>
                      </div>
                      <Download class="w-5 h-5 shrink-0 text-gray-300 group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </template>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <Card class="rounded-2xl shadow-sm border-primary overflow-hidden">
              <div class="bg-primary px-6 py-4 text-white">
                <h3 class="font-heading font-bold text-lg flex items-center gap-2">
                  <FileText class="w-5 h-5" />
                  Documentos Oficiales
                </h3>
              </div>
              <CardContent class="p-6 space-y-4">
                <p class="text-sm text-text-muted mb-4">
                  Descarga los documentos oficiales para conocer todos los detalles, temarios y reglamentos de la olimpiada.
                </p>
                <a v-if="primaryVisualUrl" :href="primaryVisualUrl" target="_blank" rel="noreferrer" class="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:border-blue-200 hover:bg-info/10 hover:shadow">
                  <div class="flex items-center gap-3">
                    <FileText class="w-5 h-5 text-text-muted group-hover:text-primary" />
                    <span class="font-semibold text-text-main group-hover:text-primary/90 text-left whitespace-normal">{{ primaryVisualLabel }}</span>
                  </div>
                  <Download class="w-5 h-5 shrink-0 text-text-muted group-hover:text-primary" />
                </a>
                <div v-else class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm font-semibold text-text-muted">Sin afiche/convocatoria</div>
                <a v-if="convocatoriaDocumentoUrl" :href="convocatoriaDocumentoUrl" target="_blank" rel="noreferrer" class="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:border-blue-200 hover:bg-info/10 hover:shadow">
                  <div class="flex items-center gap-3">
                    <BookOpen class="w-5 h-5 text-text-muted group-hover:text-primary" />
                    <span class="font-semibold text-text-main group-hover:text-primary/90 text-left whitespace-normal">Convocatoria oficial</span>
                  </div>
                  <Download class="w-5 h-5 shrink-0 text-text-muted group-hover:text-primary" />
                </a>
                <a v-if="reglamentoUrl" :href="reglamentoUrl" target="_blank" rel="noreferrer" class="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:border-blue-200 hover:bg-info/10 hover:shadow">
                  <div class="flex items-center gap-3">
                    <CheckCircle class="w-5 h-5 text-text-muted group-hover:text-primary" />
                    <span class="font-semibold text-text-main group-hover:text-primary/90 text-left whitespace-normal">Reglamento Específico</span>
                  </div>
                  <Download class="w-5 h-5 shrink-0 text-text-muted group-hover:text-primary" />
                </a>
              </CardContent>
            </Card>

            <template v-if="conv.estado === 'FINALIZADA'">
              <Card class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-sm border-slate-700 overflow-hidden text-white">
                <CardContent class="p-8">
                  <h3 class="font-heading font-bold text-xl flex items-center gap-2 mb-4 text-amber-400">
                    <Trophy class="w-6 h-6" />
                    Resultados Finales
                  </h3>
                  <p class="text-slate-300 text-sm mb-6 leading-relaxed">
                    Esta convocatoria ha finalizado. Puedes consultar el cuadro de honor y los resultados oficiales de todas las categorías.
                  </p>
                  <Button 
                    as="router-link"
                    to="/resultados"
                    size="lg"
                    class="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-text-main font-bold py-6 rounded-xl transition-colors shadow-lg h-auto"
                  >
                    Ver Cuadro de Honor
                    <ArrowRight class="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </template>
            
            <!-- Need help? -->
            <Card class="bg-info/10 rounded-2xl border-blue-100">
              <CardContent class="p-6">
                <h4 class="font-heading font-bold text-primary/90 mb-2">¿Tienes dudas?</h4>
                <p class="text-sm text-blue-800/80 mb-4">Estamos aquí para ayudarte. Contáctanos si necesitas más información sobre la convocatoria.</p>
                <router-link 
                  to="/contacto" 
                  class="text-sm font-bold text-primary hover:text-primary/90 underline underline-offset-4 flex items-center gap-1"
                >
                  Ir a contacto
                  <ArrowRight class="w-4 h-4" />
                </router-link>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </template>
    </div>
  </div>
</template>


