<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'

import type { ConvocatoriaDTO, ConvocatoriaEstadistica } from '@/modules/convocatorias/types/convocatorias.api'
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
const materialesPrincipales = ref<Record<string, any>>({})

// Uso de any[] para evadir colisiones de tipos estricto en la prop de VCalendar
const calendarAttributes = computed(() => {
  const attrs: any[] = []

  // 1. Día de hoy
  attrs.push({
    key: 'today',
    dates: new Date(),
    highlight: { fillMode: 'outline', color: 'red' },
    popover: { label: 'Día Actual (Hoy)', visibility: 'hover' }
  })

  // 2. Puntos de inicio y fin de olimpiadas (Puntos inferiores)
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

  // 3. Rango de inscripciones y Tooltips de hora exacta
  if (props.convocatoria.fecha_inicio_inscripcion && props.convocatoria.fecha_fin_inscripcion) {
    const start = new Date(props.convocatoria.fecha_inicio_inscripcion)
    const end = new Date(props.convocatoria.fecha_fin_inscripcion)

    // Remarcado Rango
    attrs.push({
      key: 'inscripciones',
      highlight: { fillMode: 'solid', color: 'yellow' },
      dates: { start, end }
    })

    // Hover Hora Inicio (Requiere visibility: hover para disparar el slot)
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

    // Hover Hora Fin (Requiere visibility: hover para disparar el slot)
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
      materialesService.materialPrincipalConvocatoria(id).catch(() => ({ data: {} }))
    ])
    
    if (resEstadisticas.data) estadisticas.value = resEstadisticas.data
    materialesPrincipales.value = resMateriales.data || {}

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
                  class="ope-calendar-theme shadow-sm border-gray-200 !w-fit max-w-full"
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

/* Aplicación del color exacto de Tailwind a la paleta de VCalendar */
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