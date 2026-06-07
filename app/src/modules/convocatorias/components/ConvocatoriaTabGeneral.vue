<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'

import type { ConvocatoriaDTO, ConvocatoriaEstadistica } from '@/modules/convocatorias/types/convocatorias.api'
import type { MaterialPrincipalPorTipo } from '@/modules/material/types/material.api'
import { convocatoriasService } from '@/modules/convocatorias/services/convocatorias.service'
import { materialesService } from '@/modules/material/services/material.service'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import ConvocatoriaTabGeneralStats from './ConvocatoriaTabGeneralStats.vue'
import ConvocatoriaTabGeneralSlider from './ConvocatoriaTabGeneralSlider.vue'

const props = defineProps<{
  convocatoria: ConvocatoriaDTO
}>()

const isLoading = ref(true)
const estadisticas = ref<ConvocatoriaEstadistica | null>(null)

const materialesPrincipales = ref<MaterialPrincipalPorTipo[]>([])

const calendarAttributes = computed(() => {
  const attrs: any[] = []

  attrs.push({
    key: 'today',
    dates: new Date(),
    highlight: { fillMode: 'outline', color: 'red' },
    popover: { label: 'Día Actual (Hoy)', visibility: 'hover' }
  })

  if (props.convocatoria.inicio_olimpiadas) {
    attrs.push({
      key: 'olimpiada-inicio',
      dot: { color: 'blue' },
      dates: new Date(props.convocatoria.inicio_olimpiadas),
      popover: { label: 'Inicio Olimpiadas', visibility: 'hover' }
    })
  }
  
  if (props.convocatoria.fin_olimpiadas) {
    attrs.push({
      key: 'olimpiada-fin',
      dot: { color: 'red' },
      dates: new Date(props.convocatoria.fin_olimpiadas),
      popover: { label: 'Fin Olimpiadas', visibility: 'hover' }
    })
  }

  if (props.convocatoria.fecha_inicio_inscripcion && props.convocatoria.fecha_fin_inscripcion) {
    const start = new Date(props.convocatoria.fecha_inicio_inscripcion)
    const end = new Date(props.convocatoria.fecha_fin_inscripcion)

    attrs.push({
      key: 'inscripciones',
      highlight: { fillMode: 'solid', color: 'yellow' },
      dates: { start, end }
    })

    attrs.push({
      key: 'inscripcion-hora-inicio',
      dates: start,
      popover: { visibility: 'hover' },
      customData: {
        type: 'inscripcion-limite',
        label: 'Apertura de Inscripciones',
        time: formatTime(props.convocatoria.fecha_inicio_inscripcion)
      }
    })

    attrs.push({
      key: 'inscripcion-hora-fin',
      dates: end,
      popover: { visibility: 'hover' },
      customData: {
        type: 'inscripcion-limite',
        label: 'Cierre de Inscripciones',
        time: formatTime(props.convocatoria.fecha_fin_inscripcion)
      }
    })
  }

  return attrs
})

const windowWidth = ref(window.innerWidth)
const calendarColumns = computed(() => windowWidth.value >= 768 ? 2 : 1)

onMounted(async () => {
  window.addEventListener('resize', () => windowWidth.value = window.innerWidth)
  await cargarDatos()
})

async function cargarDatos() {
  isLoading.value = true
  try {
    const id = props.convocatoria.id_convocatoria
    const [resEstadisticas, resMateriales] = await Promise.all([
      convocatoriasService.estadisticasConvocatoria(id).catch(() => ({ data: null })),
      materialesService.materialPrincipalConvocatoria(id).catch(() => ({ data: [] }))
    ])
    
    if (resEstadisticas.data) estadisticas.value = resEstadisticas.data
    
    // Extracción segura del Array de materiales
    let listaMats: MaterialPrincipalPorTipo[] = []
    if (Array.isArray(resMateriales.data)) {
      listaMats = resMateriales.data
    } else if (resMateriales.data && Array.isArray((resMateriales.data as any).data)) {
      listaMats = (resMateriales.data as any).data
    }
    
    materialesPrincipales.value = listaMats

  } catch (error) {
    console.error('Error al sincronizar:', error)
  } finally {
    isLoading.value = false
  }
}

function formatTime(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function statusClass(status: string) {
  switch (status) {
    case 'BORRADOR': return 'bg-estado-borrador text-white border-white/20'
    case 'OCULTA': return 'bg-estado-oculta text-white border-white/20'
    case 'CANCELADA': return 'bg-estado-cancelada text-white border-white/20'
    case 'PROXIMA': return 'bg-estado-proxima text-white border-white/20'
    case 'INSCRIPCIONES PROXIMAS': return 'bg-estado-inscripciones-proximas text-white border-white/20'
    case 'INSCRIPCION EN CURSO': return 'bg-estado-inscripcion text-white border-white/20'
    case 'EN CURSO': return 'bg-estado-en-curso text-white border-white/20'
    case 'FINALIZADA': return 'bg-estado-finalizada text-white border-white/20'
    default: return 'bg-white/20 text-white border-white/10'
  }
}
</script>

<template>
  <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center">
    <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-3"></div>
    <p class="text-text-muted text-sm font-medium">Sincronizando información...</p>
  </div>

  <div v-else class="space-y-6">
    <ConvocatoriaTabGeneralStats 
      :convocatoria="convocatoria" 
      :estadisticas="estadisticas" 
    />

    <Card class="border border-gray-200 shadow-soft bg-white">
      <CardContent class="p-6">
        
        <div class="flex flex-col lg:flex-row gap-8">
          
          <div class="w-full lg:w-[60%] flex flex-col">
            <div class="mt-1 flex items-center gap-2 text-6xl text-gray-200">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border', statusClass(convocatoria.estado)]">
                {{ convocatoria.estado_temporal }}
              </span>
            </div>
            <div class="mb-5">
              <h2 class="text-[36px] font-heading font-bold text-text-main leading-[1.1]">
                {{ convocatoria.nombre_convocatoria }}
              </h2>
              <p class="text-[28px] font-bold text-secondary mt-1 leading-[1.1]">
                Gestión {{ convocatoria.gestion }}
              </p>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
              <p class="text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                {{ convocatoria.descripcion || 'Sin descripción detallada.' }}
              </p>
            </div>

            <div class="flex-1 flex flex-col w-full">
              <p class="text-sm font-bold text-text-main mb-3 text-left w-full">Fechas y Periodos Registrados</p>
              
              <div class="w-full flex justify-center overflow-x-auto pb-2">
                <VCalendar 
                  :attributes="calendarAttributes" 
                  :columns="calendarColumns" 
                  class="ope-calendar-theme shadow-sm border-gray-200 w-fit! max-w-full"
                >
                  <template #day-popover="{ attributes }">
                    <div class="p-2.5 w-max max-w-xs">
                      <div v-for="attr in attributes" :key="attr.key">
                        <template v-if="attr.customData?.type === 'inscripcion-limite'">
                          <p class="text-[11px] font-bold text-accent-dark uppercase">{{ attr.customData.label }}</p>
                          <p class="text-sm font-bold text-text-main mt-0.5">Hora: {{ attr.customData.time }} hrs</p>
                        </template>
                        <template v-else-if="attr.popover?.label">
                          <p class="text-xs font-semibold text-primary py-0.5">{{ attr.popover.label }}</p>
                        </template>
                      </div>
                    </div>
                  </template>
                </VCalendar>
              </div>

              <div class="flex flex-wrap gap-4 mt-6 text-sm font-medium text-text-muted justify-center border-t border-gray-200 pt-4 w-full">
                <div class="flex items-center gap-2">
                  <span class="w-4 h-4 rounded-full bg-accent border-2 border-accent"></span>
                  Inscripciones
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                  Inicio Olimpiadas
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-red-500"></span>
                  Fin Olimpiadas
                </div>
              </div>
            </div>
          </div>

          <div class="w-full lg:w-[40%]">
            <p class="text-sm font-bold text-text-main mb-3 lg:hidden">Material Gráfico</p>
            <ConvocatoriaTabGeneralSlider :materiales="materialesPrincipales" />
          </div>

        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
:deep(.vc-container) {
  --vc-font-family: var(--font-sans);
  --vc-rounded-full: 0.5rem;
  border: 1px solid #e5e7eb;
}

:deep(.vc-yellow) {
  --vc-accent-50: var(--color-accent);
  --vc-accent-100: var(--color-accent);
  --vc-accent-200: var(--color-accent); 
  --vc-accent-300: var(--color-accent);
  --vc-accent-400: var(--color-accent);
  --vc-accent-500: var(--color-accent);
  --vc-accent-600: var(--color-accent); 
  
  --vc-accent-700: var(--color-primary-dark);
  --vc-accent-800: var(--color-primary-dark);
  --vc-accent-900: var(--color-primary-dark); 
}
</style>