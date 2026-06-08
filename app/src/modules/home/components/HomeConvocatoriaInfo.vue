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

const isDesktop = ref(window.innerWidth >= 1024)

const updateScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => window.addEventListener('resize', updateScreenSize))
onUnmounted(() => window.removeEventListener('resize', updateScreenSize))

const calendarAttributes = computed(() => {
  const attrs = []

  attrs.push({
    key: 'today',
    highlight: {
      color: 'green',
      fillMode: 'outline',
    },
    dates: new Date(),
    popover: { label: 'Día de consulta (Hoy)' }
  })

  if (props.activeConv.fecha_inicio_inscripcion && props.activeConv.fecha_fin_inscripcion) {
    const inicioInsc = new Date(props.activeConv.fecha_inicio_inscripcion)
    const finInsc = new Date(props.activeConv.fecha_fin_inscripcion)

    const startOfInicio = new Date(inicioInsc.getFullYear(), inicioInsc.getMonth(), inicioInsc.getDate())
    const startOfFin = new Date(finInsc.getFullYear(), finInsc.getMonth(), finInsc.getDate())
    const endOfFin = new Date(finInsc.getFullYear(), finInsc.getMonth(), finInsc.getDate(), 23, 59, 59)

    const horaInicio = inicioInsc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const horaFin = finInsc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    attrs.push({
      key: 'inscripcion',
      highlight: {
        color: 'yellow',
        fillMode: 'light',
      },
      dates: {
        start: startOfInicio,
        end: endOfFin
      },
      popover: { label: 'Periodo de Inscripciones' }
    })

    attrs.push({
      key: 'inscripcion-inicio',
      dates: startOfInicio,
      popover: { label: `Apertura: ${horaInicio}` }
    })

    attrs.push({
      key: 'inscripcion-fin',
      dates: startOfFin,
      popover: { label: `Cierre: ${horaFin}` }
    })
  }

  if (props.activeConv.inicio_olimpiadas) {
    const inicioOlim = new Date(props.activeConv.inicio_olimpiadas)
    attrs.push({
      key: 'inicio-olim',
      dot: 'blue',
      dates: new Date(inicioOlim.getFullYear(), inicioOlim.getMonth(), inicioOlim.getDate()),
      popover: { label: 'Inicio de Olimpiadas' }
    })
  }

  if (props.activeConv.fin_olimpiadas) {
    const finOlim = new Date(props.activeConv.fin_olimpiadas)
    attrs.push({
      key: 'fin-olim',
      dot: 'red',
      dates: new Date(finOlim.getFullYear(), finOlim.getMonth(), finOlim.getDate()),
      popover: { label: 'Fin de Olimpiadas' }
    })
  }

  return attrs
})

const minCalendarDate = computed(() => {
  const dates = []
  if (props.activeConv.fecha_inicio_inscripcion) dates.push(new Date(props.activeConv.fecha_inicio_inscripcion))
  if (props.activeConv.inicio_olimpiadas) dates.push(new Date(props.activeConv.inicio_olimpiadas))
  dates.push(new Date())
  return new Date(Math.min(...dates.map(d => d.getTime())))
})

const maxCalendarDate = computed(() => {
  const dates = []
  if (props.activeConv.fecha_fin_inscripcion) dates.push(new Date(props.activeConv.fecha_fin_inscripcion))
  if (props.activeConv.fin_olimpiadas) dates.push(new Date(props.activeConv.fin_olimpiadas))
  if (dates.length > 0) {
    return new Date(Math.max(...dates.map(d => d.getTime())))
  }
  return undefined
})
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
      
      <div class="bg-background p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2 mb-6 justify-center sm:justify-start">
          <Users class="w-6 h-6 text-secondary" />
          <h4 class="font-semibold text-xl text-text-main">Categorías Habilitadas</h4>
        </div>
        
        <div class="flex flex-row lg:flex-wrap gap-4 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 snap-x snap-mandatory lg:snap-none justify-start lg:justify-center hide-scrollbar">
          <div 
            v-for="cat in props.activeConv.categorias" 
            :key="cat.id_categoria" 
            class="shrink-0 snap-center flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-center w-36 sm:w-40 xl:w-44"
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
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full border-2 border-green-500"></span>
            Hoy
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
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
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

:deep(.vc-green) {
  --vc-accent-50: #22c55e;
  --vc-accent-100: #22c55e;
  --vc-accent-200: #22c55e; 
  --vc-accent-300: #22c55e;
  --vc-accent-400: #22c55e;
  --vc-accent-500: #22c55e;
  --vc-accent-600: #22c55e; 
  
  --vc-accent-700: #166534;
  --vc-accent-800: #166534;
  --vc-accent-900: #166534; 
}
</style>