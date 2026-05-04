<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Search, Filter, PlayCircle, FileText, ClipboardList, BookOpen, ExternalLink, Download 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

type TipoMaterial = 'Formularios' | 'Videos' | 'Prácticas' | 'Apuntes' | 'Exámenes' | 'Solucionarios' | 'Temarios' | 'Otros'

interface MaterialItem {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoMaterial
  convocatoria?: string
  fase?: string
  url: string
}

const materialesMock: MaterialItem[] = [
  { id: '1', nombre: 'Temario Oficial 2024', descripcion: 'Contenidos a evaluar en la primera y segunda fase.', tipo: 'Temarios', convocatoria: 'Olimpiadas 2024', url: '#' },
  { id: '2', nombre: 'Introducción a la Probabilidad', descripcion: 'Clase grabada sobre conceptos básicos y espacio muestral.', tipo: 'Videos', fase: 'Fase 1', url: '#' },
  { id: '3', nombre: 'Práctica Nivel Secundario', descripcion: 'Ejercicios propuestos para la primera fase.', tipo: 'Prácticas', convocatoria: 'Olimpiadas 2023', url: '#' },
  { id: '4', nombre: 'Examen Pasado - Final 2023', descripcion: 'Prueba oficial aplicada en la fase final del año pasado.', tipo: 'Exámenes', convocatoria: 'Olimpiadas 2023', fase: 'Fase Final', url: '#' },
  { id: '5', nombre: 'Solucionario Fase 1', descripcion: 'Respuestas y explicaciones detalladas del examen fase 1.', tipo: 'Solucionarios', convocatoria: 'Olimpiadas 2023', fase: 'Fase 1', url: '#' },
  { id: '6', nombre: 'Formulario de Inscripción Extraordinaria', descripcion: 'Llenar en caso de inscripciones rezagadas.', tipo: 'Formularios', url: '#' },
  { id: '7', nombre: 'Estadística Descriptiva Básica', descripcion: 'Resumen de medidas de tendencia central y dispersión.', tipo: 'Apuntes', url: '#' },
]

const getTipoConfig = (tipo: TipoMaterial) => {
  switch (tipo) {
    case 'Videos': return { color: 'bg-red-100 text-danger border-danger/20', icon: PlayCircle }
    case 'Formularios': return { color: 'bg-info/20 text-info border-blue-200', icon: ClipboardList }
    case 'Temarios': return { color: 'bg-success/20 text-success border-success/20', icon: BookOpen }
    case 'Prácticas': return { color: 'bg-warning/20 text-warning border-warning/20', icon: FileText }
    case 'Exámenes': return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FileText }
    case 'Solucionarios': return { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FileText }
    case 'Apuntes': return { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: BookOpen }
    default: return { color: 'bg-gray-100 text-text-main border-gray-200', icon: FileText }
  }
}

const searchTerm = ref('')
const tipoFiltro = ref<string>('Todos')
const convocatoriaFiltro = ref('Todas')

const tiposDisponibles = ['Todos', 'Formularios', 'Videos', 'Prácticas', 'Apuntes', 'Exámenes', 'Solucionarios', 'Temarios', 'Otros']
const convocatoriasDisponibles = ['Todas', 'Olimpiadas 2024', 'Olimpiadas 2023']

const filteredMaterials = computed(() => {
  return materialesMock.filter((mat) => {
    const matchSearch = mat.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
                          mat.descripcion.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchTipo = tipoFiltro.value === 'Todos' || mat.tipo === tipoFiltro.value
    const matchConvocatoria = convocatoriaFiltro.value === 'Todas' || mat.convocatoria === convocatoriaFiltro.value
    return matchSearch && matchTipo && matchConvocatoria
  })
})
</script>

<template>
  <div class="w-full bg-gray-50 min-h-screen pb-20">
    <!-- Header -->
    <div class="bg-primary text-white pt-12 pb-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-transparent" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <BookOpen class="w-16 h-16 mx-auto mb-6 opacity-90" />
        <h1 class="text-4xl md:text-5xl font-heading font-black mb-4">Material Académico</h1>
        <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
          Repositorio de recursos, guías, prácticas y documentos para tu preparación en las olimpiadas.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
     
      <!-- Filtros -->
      <Card class="rounded-2xl shadow-sm border-gray-200 p-6 mb-10">
        <CardContent class="p-0 flex flex-col md:flex-row gap-4 items-center">
          <!-- Buscador -->
          <div class="relative flex-1 w-full">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-text-muted" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              class="w-full pl-10 pr-3 py-3 border-gray-300 rounded-xl leading-5 bg-white focus-visible:ring-primary sm:text-sm transition-colors h-[50px]"
              placeholder="Buscar material por nombre o descripción..."
            />
          </div>
          
          <!-- Filtros Dropdowns -->
          <div class="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <div class="relative w-full sm:w-48 bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary h-[50px] flex items-center pl-3">
              <Filter class="h-4 w-4 text-text-muted shrink-0 z-10" />
              <select 
                v-model="tipoFiltro"
                class="border-0 bg-transparent shadow-none focus:ring-0 h-full w-full pl-2"
              >
                <option v-for="t in tiposDisponibles" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          
            <div class="relative w-full sm:w-56 bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary h-[50px] flex items-center pl-3">
              <Filter class="h-4 w-4 text-text-muted shrink-0 z-10" />
              <select 
                v-model="convocatoriaFiltro"
                class="border-0 bg-transparent shadow-none focus:ring-0 h-full w-full pl-2"
              >
                <option v-for="c in convocatoriasDisponibles" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Listado de Materiales -->
      <template v-if="filteredMaterials.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <template v-for="mat in filteredMaterials" :key="mat.id">
            <Card class="rounded-2xl shadow-sm hover:shadow-md border-gray-100 overflow-hidden transition-all flex flex-col group h-full">
              <CardContent class="p-6 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-4">
                  <Badge variant="outline" :class="`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border ${getTipoConfig(mat.tipo).color}`">
                    <component :is="getTipoConfig(mat.tipo).icon" class="w-3.5 h-3.5" />
                    {{ mat.tipo }}
                  </Badge>
                </div>
                
                <h3 class="font-heading font-bold text-text-main text-lg mb-2 leading-tight group-hover:text-primary transition-colors">
                  {{ mat.nombre }}
                </h3>
                <p class="text-sm text-text-muted mb-4 flex-1">
                  {{ mat.descripcion }}
                </p>
                
                <template v-if="mat.convocatoria || mat.fase">
                  <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                    <template v-if="mat.convocatoria">
                      <Badge variant="secondary" class="text-xs font-medium text-text-muted bg-gray-100 hover:bg-gray-100 border border-gray-200">
                        {{ mat.convocatoria }}
                      </Badge>
                    </template>
                    <template v-if="mat.fase">
                      <Badge variant="secondary" class="text-xs font-medium text-text-muted bg-gray-100 hover:bg-gray-100 border border-gray-200">
                        {{ mat.fase }}
                      </Badge>
                    </template>
                  </div>
                </template>
              </CardContent>
            
              <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
                <Button variant="outline" class="w-full inline-flex items-center justify-center gap-2 bg-white text-primary border-gray-200 hover:border-primary hover:bg-info/10 py-5 rounded-lg text-sm font-semibold transition-all h-auto">
                  <template v-if="mat.tipo === 'Videos'">
                    <PlayCircle class="w-4 h-4" /> Ver Video
                  </template>
                  <template v-else-if="mat.tipo === 'Formularios'">
                    <ExternalLink class="w-4 h-4" /> Llenar Formulario
                  </template>
                  <template v-else>
                    <Download class="w-4 h-4" /> Descargar / Ver
                  </template>
                </Button>
              </div>
            </Card>
          </template>
        </div>
      </template>

      <template v-else>
        <Card class="text-center py-20 border-gray-200 border-dashed rounded-2xl">
          <CardContent class="p-0 flex flex-col items-center">
            <BookOpen class="w-12 h-12 text-gray-300 mb-4" />
            <h3 class="text-lg font-heading font-bold text-text-main mb-1">No se encontraron materiales</h3>
            <p class="text-text-muted">Prueba ajustando los filtros de búsqueda.</p>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
