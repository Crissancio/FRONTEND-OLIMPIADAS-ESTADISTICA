<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Calendar as CalendarIcon, Users, ArrowRight } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'
import type { HomeConvocatoria } from '../types/home.types'

const props = defineProps<{
  activeConv: HomeConvocatoria
}>()

const detalleConvocatoriaTo = computed(() => ({
  name: 'convocatoria-detalle',
  params: { id: props.activeConv.id }
}))

// --- LÓGICA DEL CALENDARIO ---
const isDesktop = ref(window.innerWidth >= 1024)

const updateScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => window.addEventListener('resize', updateScreenSize))
onUnmounted(() => window.removeEventListener('resize', updateScreenSize))

const calendarAttributes = computed(() => {
  const attrs = []

  // Rango de Inscripciones 
  if (props.activeConv.fecha_inicio_inscripcion && props.activeConv.fecha_fin_inscripcion) {
    const inicioInsc = new Date(props.activeConv.fecha_inicio_inscripcion)
    const finInsc = new Date(props.activeConv.fecha_fin_inscripcion)

    // Formatear las horas para que se vean limpias (ej. "14:30")
    const horaInicio = inicioInsc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const horaFin = finInsc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // 1. Rango principal (amarillo)
    attrs.push({
      key: 'inscripcion',
      highlight: {
        color: 'yellow',
        fillMode: 'light',
      },
      dates: {
        start: inicioInsc,
        end: finInsc
      },
      popover: { label: 'Periodo de Inscripciones' }
    })

    // 2. Etiqueta extra solo para el día de INICIO
    attrs.push({
      key: 'inscripcion-inicio',
      dates: inicioInsc,
      popover: { label: `Apertura: ${horaInicio}` }
    })

    // 3. Etiqueta extra solo para el día de FIN
    attrs.push({
      key: 'inscripcion-fin',
      dates: finInsc,
      popover: { label: `Cierre: ${horaFin}` }
    })
  }

  // Fechas de olimpiadas
  if (props.activeConv.inicio_olimpiadas) {
    attrs.push({
      key: 'inicio-olim',
      dot: 'blue',
      dates: new Date(props.activeConv.inicio_olimpiadas),
      popover: { label: 'Inicio de Olimpiadas' }
    })
  }

  if (props.activeConv.fin_olimpiadas) {
    attrs.push({
      key: 'fin-olim',
      dot: 'red',
      dates: new Date(props.activeConv.fin_olimpiadas),
      popover: { label: 'Fin de Olimpiadas' }
    })
  }

  return attrs
})

const minCalendarDate = computed(() => props.activeConv.inicio_olimpiadas ? new Date(props.activeConv.inicio_olimpiadas) : undefined)
const maxCalendarDate = computed(() => props.activeConv.fin_olimpiadas ? new Date(props.activeConv.fin_olimpiadas) : undefined)
</script>

<template>
  <div class="px-1 py-4 lg:p-8 flex flex-col justify-start custom-calendar-wrapper">
    
    <h3 class="text-2xl lg:text-3xl font-heading font-bold text-primary-dark mb-4">
      {{ props.activeConv.nombre }}
    </h3>
    <p class="text-text-muted mb-8 text-base leading-relaxed">
      {{ props.activeConv.descripcionBreve }}
    </p>
    
    <div class="grid grid-cols-1 gap-8 mb-8">
      
      <div class="bg-background p-6 rounded-xl border border-gray-100 shadow-sm">
        <div class="flex items-center gap-2 mb-6">
          <Users class="w-6 h-6 text-secondary" />
          <h4 class="font-semibold text-xl text-text-main">Categorías Habilitadas</h4>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <div 
            v-for="cat in props.activeConv.categorias" 
            :key="cat.id_categoria" 
            class="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-center"
          >
            <CategorySymbol :name="cat.nombre_categoria" class="h-10 w-10 mb-3 rounded-md text-xl" />
            <span class="text-sm font-semibold text-text-main">{{ cat.nombre_categoria }}</span>
            <span class="text-sm font-semibold text-text-main">
                <p class="m-0 font-bold text-text-muted">{{ cat.curso }}° de {{ cat.nivel }}</p>
            </span>
          </div>
        </div>
      </div>

      <div class="bg-background p-6 rounded-xl border border-gray-100 shadow-sm">
        <div class="flex items-center gap-2 mb-6">
          <CalendarIcon class="w-6 h-6 text-secondary" />
          <h4 class="font-semibold text-xl text-text-main">Cronograma Oficial</h4>
        </div>
        
        <div class="w-full overflow-hidden flex justify-center">
          <VCalendar 
            :attributes="calendarAttributes"
            :min-date="minCalendarDate"
            :max-date="maxCalendarDate"
            :columns="isDesktop ? 2 : 1"
            locale="es"
            class="border-none bg-transparent"
          />
        </div>
        
        <div class="flex flex-wrap gap-4 mt-6 text-sm font-medium text-text-muted justify-center border-t border-gray-200 pt-4">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-accent border-2 border-accent"></span>
            Inscripciones
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            Inicio
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500"></span>
            Fin
          </div>
        </div>
      </div>

    </div>
    
    <div class="pt-6 border-t border-gray-100 flex justify-end mt-auto">
      <Button
        as="router-link"
        :to="detalleConvocatoriaTo"
        variant="link"
        class="text-primary text-lg font-semibold hover:text-secondary group flex items-center"
      >
        Ver portal de la convocatoria
        <ArrowRight class="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>

  </div>
</template>

<style scoped>
/* Usamos colores sólidos para evitar la superposición visible y aplicamos los colores solicitados */
:deep(.vc-yellow) {
  /* Fondo del rango y los círculos (sin transparencias) */
  --vc-accent-50: var(--color-accent);
  --vc-accent-100: var(--color-accent);
  --vc-accent-200: var(--color-accent); 
  --vc-accent-300: var(--color-accent);
  --vc-accent-400: var(--color-accent);
  --vc-accent-500: var(--color-accent);
  --vc-accent-600: var(--color-accent); 
  
  /* Color de fuente de los números */
  --vc-accent-700: var(--color-primary-dark);
  --vc-accent-800: var(--color-primary-dark);
  --vc-accent-900: var(--color-primary-dark); 
}
</style>
