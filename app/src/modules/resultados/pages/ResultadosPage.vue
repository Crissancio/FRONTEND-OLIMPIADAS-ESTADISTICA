<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Trophy, Medal, Award, Star } from 'lucide-vue-next'
import { publicService } from '@/modules/public/services/public.service'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { 
  ResultadoPublicoGeneralDTO, 
  ConvocatoriaMinified, 
  CategoriaDetalleDTO, 
  GetResultadosFinalesPublicParams 
} from '@/modules/public/types/public.api'

const resultados = ref<ResultadoPublicoGeneralDTO[]>([])
const convocatoriasOptions = ref<ConvocatoriaMinified[]>([])
const categoriasOptions = ref<CategoriaDetalleDTO[]>([])

const convFilter = ref<string>('')
const categoriaFilter = ref<string>('')
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const sortedResultados = computed(() => [...resultados.value].sort((a, b) => b.nota - a.nota))
const top3 = computed(() => sortedResultados.value.slice(0, 3))
const others = computed(() => sortedResultados.value.slice(3))

const loadResultados = async (reset = false) => {
  loading.value = true
  if (reset) {
    currentPage.value = 1
    resultados.value = []
  }

  // Construir los parámetros, omitiendo los filtros si no hay selección
  const params: GetResultadosFinalesPublicParams = {
    page: currentPage.value,
    limit: 20,
  }

  if (convFilter.value) {
    params.id_convocatoria = Number(convFilter.value)
  }
  
  if (categoriaFilter.value) {
    params.id_categoria = Number(categoriaFilter.value)
  }

  try {
    const res = await publicService.obtenerResultadosFinales(params)
    if (res && res.data) {
      if (reset) {
        resultados.value = res.data.items
      } else {
        resultados.value = [...resultados.value, ...res.data.items]
      }
      totalPages.value = res.data.meta.total_pages
    }
  } catch (err) {
    resultados.value = []
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || currentPage.value >= totalPages.value) return
  currentPage.value += 1
  await loadResultados(false)
}

watch(convFilter, async (newConv) => {
  categoriaFilter.value = ''
  categoriasOptions.value = []
  
  // Si hay una convocatoria seleccionada, cargar sus categorías
  if (newConv) {
    try {
      const res = await publicService.obtenerCategoriasPorConvocatoria(Number(newConv))
      if (res && res.data) {
        categoriasOptions.value = res.data
      }
    } catch (err) {
      categoriasOptions.value = []
    }
  }
  
  // Siempre recargar los resultados (ya sea filtrados o todos)
  await loadResultados(true)
})

watch(categoriaFilter, async () => {
  await loadResultados(true)
})

onMounted(async () => {
  try {
    const res = await publicService.obtenerConvocatoriasMinified()
    if (res && res.data) {
      convocatoriasOptions.value = res.data
    }
  } catch (err) {
    convocatoriasOptions.value = []
  }

  // Cargar resultados iniciales (sin filtros por defecto)
  await loadResultados(true)

  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) void loadMore()
  }, { rootMargin: '160px' })
  
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-12 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-heading font-black text-text-main mb-4 flex items-center gap-3">
            <Trophy class="w-10 h-10 text-warning" />
            Resultados Oficiales
          </h1>
          <p class="text-lg text-text-muted max-w-2xl">
            Consulta las calificaciones y el cuadro de honor de las olimpiadas finalizadas.
          </p>
        </div>
      </div>

      <Card class="rounded-2xl shadow-sm border-gray-200 mb-12 bg-white">
        <CardContent class="p-6 flex flex-col md:flex-row gap-6 items-center">
          <div class="w-full md:w-1/2">
            <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Convocatoria</label>
            <select 
              v-model="convFilter"
              class="w-full bg-gray-50 border border-gray-200 text-text-main rounded-xl px-4 py-3 focus-visible:ring-primary font-medium h-12.5 cursor-pointer"
            >
              <option value="">Todas las convocatorias</option>
              <option v-for="conv in convocatoriasOptions" :key="conv.id_convocatoria" :value="String(conv.id_convocatoria)">
                {{ conv.nombre_convocatoria }} ({{ conv.gestion }})
              </option>
            </select>
          </div>
          <div class="w-full md:w-1/2">
            <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Categoría</label>
            <select 
              v-model="categoriaFilter"
              :disabled="!convFilter"
              class="w-full bg-gray-50 border border-gray-200 text-text-main rounded-xl px-4 py-3 focus-visible:ring-primary font-medium h-12.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              <option v-for="cat in categoriasOptions" :key="cat.id_categoria" :value="String(cat.id_categoria)">
                {{ cat.nombre_categoria }} - {{ cat.curso }} ({{ cat.nivel }})
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <template v-if="top3.length > 0">
        <div class="mb-16">
          <h2 class="text-2xl font-heading font-bold text-center text-text-main mb-12 flex items-center justify-center gap-2">
            <Star class="w-6 h-6 text-warning fill-amber-500" />
            Cuadro de Honor
            <Star class="w-6 h-6 text-warning fill-amber-500" />
          </h2>
          
          <div class="flex flex-col md:flex-row justify-center items-end gap-6 h-100 md:h-87.5 max-w-4xl mx-auto px-4">
            <template v-if="top3[1]">
              <div class="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1 h-[80%]">
                <div class="bg-white border-2 border-slate-200 p-4 rounded-xl shadow-md w-full text-center relative mb-4 z-10 hover:-translate-y-2 transition-transform">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 text-text-muted rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-sm font-black text-xl">2</div>
                  <h3 class="font-bold text-text-main mt-4 leading-tight">{{ top3[1].nombres }} {{ top3[1].paterno }}</h3>
                  <p class="text-sm text-text-muted mt-1 font-medium">{{ top3[1].nota }}</p>
                </div>
                <div class="w-full bg-linear-to-t from-slate-300 to-slate-200 grow rounded-t-lg border-t-4 border-slate-400 opacity-90 shadow-inner flex items-center justify-center">
                  <Medal class="w-12 h-12 text-text-muted/50" />
                </div>
              </div>
            </template>
            
            <template v-if="top3[0]">
              <div class="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 h-full">
                <div class="bg-white border-2 border-warning/20 p-5 rounded-xl shadow-lg w-full text-center relative mb-4 z-10 hover:-translate-y-2 transition-transform scale-105">
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-md font-black text-3xl">1</div>
                  <h3 class="font-bold text-text-main mt-6 text-lg leading-tight">{{ top3[0].nombres }} {{ top3[0].paterno }}</h3>
                  <p class="text-sm font-bold text-warning mt-1 bg-warning/10 inline-block px-2 py-1 rounded">{{ top3[0].nota }}</p>
                </div>
                <div class="w-full bg-linear-to-t from-amber-400 to-amber-300 grow rounded-t-lg border-t-4 border-amber-500 opacity-90 shadow-inner flex items-center justify-center">
                  <Trophy class="w-16 h-16 text-warning/50" />
                </div>
              </div>
            </template>
            
            <template v-if="top3[2]">
              <div class="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3 h-[70%]">
                <div class="bg-white border-2 border-amber-700/30 p-4 rounded-xl shadow-md w-full text-center relative mb-4 z-10 hover:-translate-y-2 transition-transform">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-700/80 text-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-sm font-black text-xl">3</div>
                  <h3 class="font-bold text-text-main mt-4 leading-tight">{{ top3[2].nombres }} {{ top3[2].paterno }}</h3>
                  <p class="text-sm text-text-muted mt-1 font-medium">{{ top3[2].nota }}</p>
                </div>
                <div class="w-full bg-linear-to-t from-amber-800/20 to-amber-700/20 grow rounded-t-lg border-t-4 border-amber-700/40 opacity-90 shadow-inner flex items-center justify-center">
                  <Award class="w-10 h-10 text-amber-800/30" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <Card class="rounded-2xl shadow-sm border-gray-200 overflow-hidden bg-white">
        <CardContent class="p-0 overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 border-b border-gray-200">
              <tr>
                <th class="py-4 px-6 font-bold text-xs uppercase text-text-muted tracking-wider">Posición</th>
                <th class="py-4 px-6 font-bold text-xs uppercase text-text-muted tracking-wider">Nombre Completo</th>
                <th class="py-4 px-6 font-bold text-xs uppercase text-text-muted tracking-wider">C.I.</th>
                <th class="py-4 px-6 font-bold text-xs uppercase text-text-muted tracking-wider text-right">Nota Final</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(res, index) in others" :key="res.carnet_identidad" class="hover:bg-gray-50/50 transition-colors">
                <td class="py-4 px-6">
                  <Badge variant="secondary" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-text-muted font-bold text-sm">
                    {{ index + 4 }}
                  </Badge>
                </td>
                <td class="py-4 px-6 font-semibold text-text-main">{{ res.nombres }} {{ res.paterno }} {{ res.materno ?? '' }}</td>
                <td class="py-4 px-6 text-text-muted font-medium">{{ res.carnet_identidad }}</td>
                <td class="py-4 px-6 text-right">
                  <Badge variant="outline" class="px-2.5 py-1 rounded bg-success/10 text-success font-bold border-success/20">
                    {{ res.nota }}
                  </Badge>
                </td>
              </tr>
              <tr v-if="resultados.length === 0 && !loading">
                <td colspan="4" class="py-12 text-center text-text-muted font-medium">
                  No se encontraron resultados disponibles para la selección actual.
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <div ref="sentinel" class="h-16 flex items-center justify-center text-sm text-text-muted w-full mt-4">
        <span v-if="loading" class="font-medium animate-pulse">Cargando calificaciones...</span>
      </div>
    </div>
  </div>
</template>