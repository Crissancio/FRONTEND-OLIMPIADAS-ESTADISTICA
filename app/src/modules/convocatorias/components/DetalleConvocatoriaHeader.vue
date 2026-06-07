<script setup lang="ts">
import { ArrowRight, Trophy } from 'lucide-vue-next'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

defineProps<{
  convocatoria: {
    nombre: string
    gestion: number
    estado: string
    descripcionBreve: string
  }
  showInscripcion: boolean
}>()

const getEstadoClasses = (estado: string) => {
  const e = (estado || '').toUpperCase().trim()
  switch (e) {
    case 'BORRADOR':
      return 'bg-[var(--color-estado-borrador)] border-[var(--color-estado-borrador)]'
    case 'OCULTA':
      return 'bg-[var(--color-estado-oculta)] border-[var(--color-estado-oculta)]'
    case 'CANCELADA':
      return 'bg-[var(--color-estado-cancelada)] border-[var(--color-estado-cancelada)]'
    case 'PROXIMA':
      return 'bg-[var(--color-estado-proxima)] border-[var(--color-estado-proxima)]'
    case 'INSCRIPCIONES PROXIMAS':
      return 'bg-[var(--color-estado-inscripciones-proximas)] border-[var(--color-estado-inscripciones-proximas)]'
    case 'INSCRIPCION EN CURSO':
      return 'bg-[var(--color-estado-inscripcion)] border-[var(--color-estado-inscripcion)]'
    case 'EN CURSO':
      return 'bg-[var(--color-estado-en-curso)] border-[var(--color-estado-en-curso)]'
    case 'FINALIZADA':
      return 'bg-[var(--color-estado-finalizada)] border-[var(--color-estado-finalizada)]'
    default:
      return 'bg-[var(--color-estado-borrador)] border-[var(--color-estado-borrador)]'
  }
}
</script>

<template>
  <div class="bg-slate-900 text-white pt-16 pb-12 relative overflow-hidden">
    <div class="absolute inset-0 bg-primary opacity-30 mix-blend-multiply" />
    
    <div 
      class="absolute inset-0 opacity-15" 
      style="background-image: url('data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' font-family=\'serif\' font-size=\'24\' font-style=\'italic\' font-weight=\'bold\'%3E%3Ctext x=\'20\' y=\'30\'%3EΣ%3C/text%3E%3Ctext x=\'70\' y=\'45\'%3Eμ%3C/text%3E%3Ctext x=\'40\' y=\'80\'%3Eσ%3C/text%3E%3Ctext x=\'95\' y=\'90\'%3Eπ%3C/text%3E%3Ctext x=\'15\' y=\'105\'%3EΔ%3C/text%3E%3Ctext x=\'60\' y=\'115\'%3E∫%3C/text%3E%3Ctext x=\'100\' y=\'25\'%3Eα%3C/text%3E%3C/g%3E%3C/svg%3E'); background-size: 120px 120px;"
    ></div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <router-link to="/convocatorias" class="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm font-semibold transition-colors mb-8 group">
        <ArrowRight class="w-4 h-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" />
        Volver a convocatorias
      </router-link>
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="max-w-3xl">
          <div class="flex items-center gap-3 mb-5">
            <Badge 
              variant="outline"
              :class="`px-4 py-1.5 text-lg text-white font-bold uppercase tracking-wider rounded-md border-2 flex items-center gap-2 shadow-sm ${getEstadoClasses(convocatoria.estado)}`"
            >
              <span v-if="convocatoria.estado === 'EN CURSO' || convocatoria.estado === 'INSCRIPCION EN CURSO'" class="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              {{ convocatoria.estado }}
            </Badge>
          </div>

          <h1 class="text-4xl md:text-5xl font-heading font-extrabold mb-1 leading-tight text-white drop-shadow-md">
            {{ convocatoria.nombre }}
          </h1>

          <h2 class="text-2xl md:text-3xl font-heading font-bold mb-4 text-secondary drop-shadow-sm">
            Gestión {{ convocatoria.gestion }}
          </h2>

          <p class="text-xl text-blue-50/90 font-medium leading-relaxed max-w-2xl mt-4">
            {{ convocatoria.descripcionBreve }}
          </p>
        </div>
        
        <div class="shrink-0 pt-4 md:pt-0" v-if="showInscripcion">
          <Button
            variant="not_allowed"
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
</template>