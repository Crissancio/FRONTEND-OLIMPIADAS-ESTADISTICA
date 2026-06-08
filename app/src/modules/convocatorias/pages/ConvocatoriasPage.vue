<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Search, Filter, Calendar, ArrowRight } from 'lucide-vue-next'
import { publicService } from '@/modules/public/services/public.service'
import { toApiError } from '@/app/api/api-error'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Select from '@/shared/components/ui/molecules/Select.vue'
import type { ConvocatoriaListPublicDTO } from '@/modules/public/types/public.api'
import type { EstadoTemporal } from '@/modules/convocatorias/types/convocatorias.api'

type FilterType = 'TODAS' | EstadoTemporal

interface PublicConvocatoriaCard extends ConvocatoriaListPublicDTO {
  estado_temporal: EstadoTemporal
  fechasFormateadas: string
}

const rawConvocatorias = ref<ConvocatoriaListPublicDTO[]>([])
const filter = ref<FilterType>('TODAS')
const yearFilter = ref<string>('Todos')
const isLoading = ref(false)
const error = ref<string | null>(null)

const itemsToShow = ref(5)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const formatDate = (value?: string | null) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return 'Fechas por definir'
  return [formatDate(start), formatDate(end)].filter(Boolean).join(' al ')
}

// 1. Corregido: Claves con espacios para cumplir estrictamente con EstadoTemporal
const estadoLabels: Record<EstadoTemporal, string> = {
  BORRADOR: 'Borrador',
  OCULTA: 'Oculta',
  CANCELADA: 'Cancelada',
  PROXIMA: 'Próxima',
  'INSCRIPCIONES PROXIMAS': 'Próximas Inscripciones',
  'INSCRIPCION EN CURSO': 'Inscripción en Curso',
  'EN CURSO': 'En Curso',
  FINALIZADA: 'Finalizada'
}

// 2. Corregido: Ahora reemplaza los ESPACIOS por guiones para hacer match con tu style.css
const getEstadoStyles = (estado: EstadoTemporal) => {
  const normalized = estado.toLowerCase().replace(/ /g, '-') // "en curso" -> "en-curso"
  return {
    color: `var(--color-estado-${normalized})`,
    backgroundColor: `var(--color-estado-${normalized}-soft)`,
    borderColor: `calc(var(--color-estado-${normalized}) / 0.2)`
  }
}

// 3. Corregido: Retorna strings con espacios en vez de guiones bajos
const inferirEstadoTemporal = (item: ConvocatoriaListPublicDTO): EstadoTemporal => {
  const itemConEstado = item as any
  if (itemConEstado.estado_temporal) return itemConEstado.estado_temporal

  const now = new Date()
  if (item.fin_olimpiadas && new Date(item.fin_olimpiadas) < now) return 'FINALIZADA'
  if (item.inicio_olimpiadas && new Date(item.inicio_olimpiadas) <= now) return 'EN CURSO'
  return 'PROXIMA'
}

const convocatoriasMapped = computed<PublicConvocatoriaCard[]>(() => {
  return rawConvocatorias.value.map((conv) => {
    const estado = inferirEstadoTemporal(conv)
    return {
      ...conv,
      estado_temporal: estado,
      fechasFormateadas: formatRange(conv.inicio_olimpiadas, conv.fin_olimpiadas)
    }
  })
})

const years = computed(() => {
  const uniqueYears = Array.from(new Set(convocatoriasMapped.value.map(c => c.gestion.toString())))
  return ['Todos', ...uniqueYears]
})

const filteredData = computed(() => {
  return convocatoriasMapped.value
    .filter(c => filter.value === 'TODAS' || c.estado_temporal === filter.value)
    .filter(c => yearFilter.value === 'Todos' || c.gestion.toString() === yearFilter.value)
    .sort((a, b) => {
      // Corregido internamente con espacios
      const prioridades: EstadoTemporal[] = ['INSCRIPCION EN CURSO', 'EN CURSO', 'INSCRIPCIONES PROXIMAS', 'PROXIMA']
      const idxA = prioridades.indexOf(a.estado_temporal)
      const idxB = prioridades.indexOf(b.estado_temporal)
      
      if (idxA !== -1 && idxB === -1) return -1
      if (idxA === -1 && idxB !== -1) return 1
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      
      return b.gestion - a.gestion
    })
})

const paginatedData = computed(() => {
  return filteredData.value.slice(0, itemsToShow.value)
})

const loadConvocatorias = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await publicService.obtenerConvocatoriasList()
    if (res && res.data) {
      rawConvocatorias.value = res.data
    }
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    isLoading.value = false
  }
}

const setupInfiniteScroll = () => {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver((entries) => {
    const first = entries[0]
    if (first.isIntersecting && itemsToShow.value < filteredData.value.length) {
      itemsToShow.value += 5 
    }
  }, { threshold: 0.1 })

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

watch([filter, yearFilter], () => {
  itemsToShow.value = 5
})

watch(loadMoreTrigger, () => {
  if (loadMoreTrigger.value) setupInfiniteScroll()
})

onMounted(() => {
  void loadConvocatorias()
  setupInfiniteScroll()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
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
              { value: 'INSCRIPCIONES PROXIMAS', label: 'Inscripciones Próximas' },
              { value: 'INSCRIPCION EN CURSO', label: 'Inscripción en curso' },
              { value: 'EN CURSO', label: 'En curso' },
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
      <div v-if="isLoading && rawConvocatorias.length === 0" class="py-16 text-center text-text-muted font-medium">
        Cargando convocatorias...
      </div>
     <div v-else-if="error" class="py-16 text-center text-danger font-medium">
        {{ error }}
      </div>

      <template v-else-if="paginatedData.length > 0">
        <Card v-for="conv in paginatedData" :key="conv.id_convocatoria"
          class="rounded-xl shadow-soft transition-all hover:shadow-md overflow-hidden relative group bg-white border border-gray-200">
          <CardContent class="p-0">
            <div class="md:flex h-full items-stretch">

              <div
                class="p-6 md:w-1/4 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gray-100 transition-colors"
                :style="{}"
              >
                <span class="text-5xl font-heading font-black text-text-main mb-3">
                  {{ conv.gestion }}
                </span>
                
                <Badge 
                  class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border shadow-none flex items-center justify-center gap-1.5"
                  :style="{ 
                    color: getEstadoStyles(conv.estado_temporal).color, 
                    backgroundColor: getEstadoStyles(conv.estado_temporal).backgroundColor,
                    borderColor: getEstadoStyles(conv.estado_temporal).color + '33'
                  }"
                >
                  <span 
                    v-if="['INSCRIPCION', 'EN CURSO'].includes(conv.estado_temporal)" 
                    class="w-1.5 h-1.5 rounded-full animate-pulse"
                    :style="{ backgroundColor: getEstadoStyles(conv.estado_temporal).color }"
                  />
                  {{ estadoLabels[conv.estado_temporal] }}
                </Badge>
                
                <h3 class="font-heading font-bold text-text-main text-base mt-3 leading-tight">
                  {{ conv.nombre_convocatoria }}
                </h3>
              </div>
              
              <div class="p-6 md:w-3/4 flex flex-col justify-between">
                <div>
                  <p class="text-text-muted mb-5 text-sm leading-relaxed">
                    {{ conv.descripcion ?? 'Sin descripción registrada para esta edición.' }}
                  </p>
                  
                  <div class="flex flex-wrap gap-y-3 gap-x-6 text-sm text-text-main mb-2">
                    <div class="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md border border-gray-100">
                      <Calendar class="w-4 h-4 text-secondary" />
                      <span class="font-semibold">{{ conv.fechasFormateadas }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex justify-end pt-4 border-t border-gray-100 mt-4">
                  <Button 
                    as="router-link"
                    :to="{ name: 'convocatoria-detalle', params: { id: conv.id_convocatoria } }"
                    :variant="['INSCRIPCION', 'EN CURSO'].includes(conv.estado_temporal) ? 'default' : 'outline'"
                    class="font-bold text-sm shadow-sm py-2.5 px-5 flex items-center gap-2 transition-all"
                  >
                    <template v-if="['INSCRIPCION', 'EN CURSO'].includes(conv.estado_temporal)">
                      Ver y Participar
                    </template>
                    <template v-else>
                      Ver Detalles
                    </template>
                    <ArrowRight class="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <div 
          ref="loadMoreTrigger" 
          class="w-full text-center py-4 text-sm font-medium text-text-muted transition-opacity duration-200"
          :class="itemsToShow >= filteredData.length ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'"
        >
          Cargando más convocatorias...
        </div>
      </template>

      <Card v-else class="text-center py-20 border-dashed border-gray-300 bg-background">
        <CardContent>
          <Search class="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 class="text-lg font-heading font-bold text-text-main mb-2">
            No se encontraron convocatorias
          </h3>
          <p class="text-text-muted text-sm">
            Prueba ajustando los filtros de búsqueda superior.
          </p>
        </CardContent>
      </Card>
    </div>

  </div>
</template>