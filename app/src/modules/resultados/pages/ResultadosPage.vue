<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  Search, Trophy, Medal, Download, Award, Star 
} from 'lucide-vue-next'
import { usePublicStore } from '@/modules/public/stores/public.store'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const publicStore = usePublicStore()
const searchTerm = ref('')
const convFilter = ref('')
const categoriaFilter = ref('')
const currentPage = ref(1)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const filteredResultados = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return publicStore.resultados.filter(r => 
    r.carnet_identidad.toLowerCase().includes(term) ||
    `${r.nombres} ${r.paterno} ${r.materno ?? ''}`.toLowerCase().includes(term)
  )
})

const sortedResultados = computed(() => [...filteredResultados.value].sort((a, b) => b.nota - a.nota))
const top3 = computed(() => sortedResultados.value.slice(0, 3))
const others = computed(() => sortedResultados.value.slice(3))

const convocatoriaOptions = computed(() => {
  return publicStore.convocatoriasMinified.map(conv => ({ id: String(conv.id_convocatoria), label: `${conv.nombre_convocatoria} (${conv.gestion})` }))
})

const loadResultados = async (reset = false) => {
  if (reset) currentPage.value = 1
  await publicStore.fetchResultados({
    page: currentPage.value,
    limit: 20,
    id_convocatoria: convFilter.value ? Number(convFilter.value) : null,
    id_categoria: categoriaFilter.value ? Number(categoriaFilter.value) : null,
  }, !reset)
}

const loadMore = async () => {
  if (publicStore.loading || !publicStore.metaResultados || currentPage.value >= publicStore.metaResultados.total_pages) return
  currentPage.value += 1
  await loadResultados(false)
}

watch([convFilter, categoriaFilter], () => void loadResultados(true))

onMounted(async () => {
  await publicStore.fetchConvocatoriasMinified()
  convFilter.value = convocatoriaOptions.value[0]?.id ?? ''
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
       
        <Button variant="outline" class="px-6 py-6 rounded-xl font-bold shadow-sm h-fit">
          <Download class="w-5 h-5" />
          Descargar PDF Oficial
        </Button>
      </div>

      <!-- Filters -->
      <Card class="rounded-2xl shadow-sm border-gray-200 mb-12">
        <CardContent class="p-6 flex flex-col md:flex-row gap-4 items-center">
          <div class="w-full md:w-1/3">
            <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Convocatoria</label>
            <select 
              v-model="convFilter"
              class="w-full bg-gray-50 border-gray-200 text-text-main rounded-xl px-4 py-3 focus-visible:ring-primary font-medium h-[50px]"
            >
              <option v-for="conv in convocatoriaOptions" :key="conv.id" :value="conv.id">
                {{ conv.label }}
              </option>
            </select>
          </div>
          <div class="w-full md:w-1/3">
            <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Categoría</label>
            <select 
              v-model="categoriaFilter"
              class="w-full bg-gray-50 border-gray-200 text-text-main rounded-xl px-4 py-3 focus-visible:ring-primary font-medium h-[50px]"
            >
              <option value="secundaria">Nivel Secundaria</option>
              <option value="universitario">Nivel Universitario</option>
            </select>
          </div>
          <div class="w-full md:w-1/3">
            <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Buscar Participante</label>
            <div class="relative">
              <input 
                v-model="searchTerm"
                type="text" 
                placeholder="Buscar por CI o Apellidos..." 
                class="w-full bg-white border-gray-200 text-text-main rounded-xl pl-12 pr-4 py-3 focus-visible:ring-primary h-auto"
              />
              <Search class="w-5 h-5 text-text-muted absolute left-4 top-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Podium -->
      <template v-if="!searchTerm && top3.length > 0">
        <div class="mb-16">
          <h2 class="text-2xl font-heading font-bold text-center text-text-main mb-12 flex items-center justify-center gap-2">
            <Star class="w-6 h-6 text-warning fill-amber-500" />
            Cuadro de Honor
            <Star class="w-6 h-6 text-warning fill-amber-500" />
          </h2>
          
          <div class="flex flex-col md:flex-row justify-center items-end gap-6 h-[400px] md:h-[350px] max-w-4xl mx-auto px-4">
            <!-- 2nd Place -->
            <template v-if="top3[1]">
              <div class="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1 h-[80%]">
                <div class="bg-white border-2 border-slate-200 p-4 rounded-xl shadow-md w-full text-center relative mb-4 z-10 hover:-translate-y-2 transition-transform">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 text-text-muted rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-sm font-black text-xl">2</div>
                  <h3 class="font-bold text-text-main mt-4 leading-tight">{{ top3[1].nombres }} {{ top3[1].paterno }}</h3>
                  <p class="text-sm text-text-muted mt-1 font-medium">{{ top3[1].nota }}</p>
                </div>
                <div class="w-full bg-gradient-to-t from-slate-300 to-slate-200 flex-grow rounded-t-lg border-t-4 border-slate-400 opacity-90 shadow-inner flex items-center justify-center">
                  <Medal class="w-12 h-12 text-text-muted/50" />
                </div>
              </div>
            </template>
            
            <!-- 1st Place -->
            <template v-if="top3[0]">
              <div class="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 h-full">
                <div class="bg-white border-2 border-warning/20 p-5 rounded-xl shadow-lg w-full text-center relative mb-4 z-10 hover:-translate-y-2 transition-transform scale-105">
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-md font-black text-3xl">1</div>
                  <h3 class="font-bold text-text-main mt-6 text-lg leading-tight">{{ top3[0].nombres }} {{ top3[0].paterno }}</h3>
                  <p class="text-sm font-bold text-warning mt-1 bg-warning/10 inline-block px-2 py-1 rounded">{{ top3[0].nota }}</p>
                </div>
                <div class="w-full bg-gradient-to-t from-amber-400 to-amber-300 flex-grow rounded-t-lg border-t-4 border-amber-500 opacity-90 shadow-inner flex items-center justify-center">
                  <Trophy class="w-16 h-16 text-warning/50" />
                </div>
              </div>
            </template>
            
            <!-- 3rd Place -->
            <template v-if="top3[2]">
              <div class="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3 h-[70%]">
                <div class="bg-white border-2 border-amber-700/30 p-4 rounded-xl shadow-md w-full text-center relative mb-4 z-10 hover:-translate-y-2 transition-transform">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-700/80 text-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-sm font-black text-xl">3</div>
                  <h3 class="font-bold text-text-main mt-4 leading-tight">{{ top3[2].nombres }} {{ top3[2].paterno }}</h3>
                  <p class="text-sm text-text-muted mt-1 font-medium">{{ top3[2].nota }}</p>
                </div>
                <div class="w-full bg-gradient-to-t from-amber-800/20 to-amber-700/20 flex-grow rounded-t-lg border-t-4 border-amber-700/40 opacity-90 shadow-inner flex items-center justify-center">
                  <Award class="w-10 h-10 text-amber-800/30" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- Table -->
      <Card class="rounded-2xl shadow-sm border-gray-200 overflow-hidden">
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
              <tr v-for="(res, index) in (searchTerm ? filteredResultados : others)" :key="res.carnet_identidad" class="hover:bg-gray-50/50 transition-colors">
                <td class="py-4 px-6">
                  <Badge variant="secondary" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-text-muted font-bold text-sm">
                    {{ searchTerm ? index + 1 : index + 4 }}
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
              <tr v-if="filteredResultados.length === 0">
                <td colspan="4" class="py-12 text-center text-text-muted font-medium">
                  No se encontraron resultados para tu búsqueda.
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div ref="sentinel" class="h-16"></div>
    </div>
  </div>
</template>
