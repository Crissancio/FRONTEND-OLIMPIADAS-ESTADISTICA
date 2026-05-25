<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Filter, Calendar, Users, ArrowRight } from 'lucide-vue-next'
import { usePublicStore } from '@/modules/public/stores/public.store'
import { toApiError } from '@/app/api/api-error'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Select from '@/shared/components/ui/molecules/Select.vue'

type FilterType = 'TODAS' | 'PROXIMA' | 'ACTIVA' | 'INSCRIPCION EN CURSO' | 'FINALIZADA'
type PublicConvocatoriaCard = {
  id: string
  nombre: string
  gestion: number
  estado: string
  descripcionCompleta: string
  fechas: string
  categorias: number
}

const publicStore = usePublicStore()
const filter = ref<FilterType>('TODAS')
const yearFilter = ref<string>('Todos')
const isLoading = ref(false)
const error = ref<string | null>(null)

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : ''
const formatRange = (start?: string | null, end?: string | null) => [formatDate(start), formatDate(end)].filter(Boolean).join(' - ')

const convocatorias = computed<PublicConvocatoriaCard[]>(() => {
  const conv = publicStore.inicio?.convocatoria
  if (!conv) return []

  return [{
    id: String(conv.id_convocatoria),
    nombre: conv.nombre_convocatoria,
    gestion: conv.gestion,
    estado: conv.estado,
    descripcionCompleta: conv.descripcion ?? 'Sin descripcion registrada.',
    fechas: formatRange(conv.inicio_olimpiadas, conv.fin_olimpiadas) || formatRange(conv.fecha_inicio_inscripcion, conv.fecha_fin_inscripcion),
    categorias: publicStore.inicio?.categorias?.length ?? 0,
  }]
})

const years = computed(() => {
  const uniqueYears = Array.from(new Set(convocatorias.value.map(c => c.gestion.toString())))
  return ['Todos', ...uniqueYears]
})

const filteredData = computed(() => {
  return convocatorias.value
    .filter(c => filter.value === 'TODAS' || c.estado === filter.value)
    .filter(c => yearFilter.value === 'Todos' || c.gestion.toString() === yearFilter.value)
    .sort((a, b) => {
      if (a.estado === 'INSCRIPCION EN CURSO' && b.estado !== 'INSCRIPCION EN CURSO') return -1
      if (a.estado !== 'INSCRIPCION EN CURSO' && b.estado === 'INSCRIPCION EN CURSO') return 1
      return b.gestion - a.gestion
    })
})

const loadConvocatorias = async () => {
  isLoading.value = true
  error.value = null
  try {
    await publicStore.loadInicio()
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadConvocatorias()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl font-heading font-bold text-primary-dark mb-3">Convocatorias</h1>
        <p class="text-text-muted max-w-2xl text-lg">
          Explora el histórico de olimpiadas y encuentra las convocatorias activas para participar en la presente gestión.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center gap-2 px-3 bg-background rounded-md border border-gray-200">
          <Filter class="w-4 h-4 text-text-muted shrink-0" />
          <Select 
            :model-value="filter"
            :options="[
              { value: 'TODAS', label: 'Todos los estados' },
              { value: 'PROXIMA', label: 'Próximas' },
              { value: 'ACTIVA', label: 'Activas' },
              { value: 'INSCRIPCION EN CURSO', label: 'Inscripción en curso' },
              { value: 'FINALIZADA', label: 'Finalizadas' }
            ]"
            placeholder="Estado"
            @update:model-value="filter = $event as FilterType"
          />
        </div>
        <div class="flex items-center gap-2 px-3 bg-background rounded-md border border-gray-200">
          <Calendar class="w-4 h-4 text-text-muted shrink-0" />
          <Select 
            :model-value="yearFilter"
            :options="years.map(y => ({ value: y, label: y === 'Todos' ? 'Todas las gestiones' : `Gestión ${y}` }))"
            placeholder="Gestión"
            @update:model-value="yearFilter = $event"
          />
        </div>
      </div>
    </div>

    <div class="grid gap-6">
      <div v-if="isLoading" class="py-16 text-center text-text-muted font-medium">Cargando convocatorias...</div>
      <div v-else-if="error" class="py-16 text-center text-danger font-medium">{{ error }}</div>

      <template v-else-if="filteredData.length > 0">
        <Card
          v-for="conv in filteredData"
          :key="conv.id"
          :class="`rounded-xl shadow-soft transition-all hover:shadow-md overflow-hidden relative group bg-white ${conv.estado === 'ACTIVA' || conv.estado === 'INSCRIPCION EN CURSO' ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'}`"
        >
          <CardContent class="p-0">
            <div class="md:flex h-full items-stretch">
              <div :class="`p-6 md:w-1/4 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gray-100 ${conv.estado === 'ACTIVA' || conv.estado === 'INSCRIPCION EN CURSO' ? 'bg-info/10/30' : 'bg-background'}`">
                <span class="text-5xl font-heading font-black text-text-main/5 mb-3">{{ conv.gestion }}</span>
                  <Badge 
                    :class="`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border shadow-none ${conv.estado === 'ACTIVA' || conv.estado === 'INSCRIPCION EN CURSO' ? 'bg-success/10 text-success border-success/20' : 'bg-gray-100 text-text-muted border-gray-200'}`"
                  >
                    <span v-if="conv.estado === 'ACTIVA' || conv.estado === 'INSCRIPCION EN CURSO'" class="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block mr-1.5 align-middle"></span>
                    {{ conv.estado }}
                  </Badge>
                <h3 class="font-heading font-bold text-text-main text-lg mt-3">{{ conv.nombre }}</h3>
              </div>
              
              <div class="p-6 md:w-3/4 flex flex-col justify-between">
                <div>
                  <p class="text-text-muted mb-5 text-sm leading-relaxed">{{ conv.descripcionCompleta }}</p>
                  
                  <div class="flex flex-wrap gap-y-3 gap-x-6 text-sm text-text-main mb-6">
                    <div class="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md border border-gray-100">
                      <Calendar class="w-4 h-4 text-secondary" />
                      <span class="font-semibold">{{ conv.fechas }}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md border border-gray-100">
                      <Users class="w-4 h-4 text-secondary" />
                      <span class="font-semibold">{{ conv.categorias }} Categorías</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex justify-end pt-4 border-t border-gray-100">
                  <Button 
                    as="router-link"
                    :to="{ name: 'convocatoria-detalle', params: { id: conv.id } }"
                    :variant="conv.estado === 'ACTIVA' || conv.estado === 'INSCRIPCION EN CURSO' ? 'default' : 'outline'"
                    class="font-bold text-sm shadow-sm py-2.5 px-5 flex items-center gap-2 transition-all"
                  >
                    <template v-if="conv.estado === 'ACTIVA' || conv.estado === 'INSCRIPCION EN CURSO'">Ver y Participar</template>
                    <template v-else>Ver Histórico</template>
                    <ArrowRight class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>

      <Card v-else class="text-center py-20 border-dashed border-gray-300 bg-background">
        <CardContent>
          <Search class="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 class="text-lg font-heading font-bold text-text-main mb-2">No se encontraron convocatorias</h3>
          <p class="text-text-muted text-sm">Prueba ajustando los filtros de búsqueda.</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
