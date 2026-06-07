<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, Monitor, MapPin, ChevronDown, Download, Trophy, Table } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

defineProps<{ fase: any }>()
const isExpandedMats = ref(false)
const isExpandedResults = ref(true) // En la final, los resultados suelen estar abiertos por defecto si existen
</script>

<template>
  <Card class="relative bg-linear-to-br from-white to-orange-50/30 border border-orange-100 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] hover:z-10 transition-all duration-300 overflow-hidden group">
    
    <Trophy class="absolute -right-8 top-1/2 -translate-y-1/2 w-56 h-56 opacity-[0.04] text-(--color-accent) pointer-events-none group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500" />
    
    <CardContent class="p-0 relative z-10">
      <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h4 class="text-2xl font-heading font-extrabold text-(--color-accent) uppercase tracking-wide flex items-center gap-2">
          <Trophy class="w-6 h-6" />
          {{ fase.nombre }}
        </h4>
        <span class="text-sm font-semibold text-text-muted flex items-center gap-1.5">
          <Calendar class="w-4 h-4" />
          {{ fase.fechas }}
        </span>
      </div>
      
      <div class="flex flex-wrap gap-2 mb-4">
        <Badge class="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-(--color-accent) text-white shadow-sm">
          Prueba Final
        </Badge>
        <Badge v-if="fase.modalidad" class="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-white text-gray-600 border-gray-200 shadow-sm flex items-center gap-1">
          <component :is="fase.modalidad === 'Virtual' ? Monitor : MapPin" class="w-3.5 h-3.5" />
          {{ fase.modalidad }}
        </Badge>
      </div>

      <p class="text-text-muted mb-6 text-base max-w-3xl leading-relaxed">{{ fase.descripcion }}</p>

      <div v-if="fase.materiales && fase.materiales.length > 0" class="mt-4 border-t border-orange-100/50 pt-4">
        <button @click="isExpandedMats = !isExpandedMats" class="flex items-center gap-2 text-sm font-bold text-text-main hover:text-(--color-accent) transition-colors">
          Recursos y Solucionarios ({{ fase.materiales.length }})
          <ChevronDown class="w-4 h-4 transition-transform duration-300" :class="isExpandedMats ? 'rotate-180' : ''" />
        </button>
        
        <div v-show="isExpandedMats" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
           <a v-for="mat in fase.materiales" :key="mat.id" :href="mat.url" target="_blank" class="flex items-center justify-between p-3 rounded-lg border border-orange-100/50 bg-white hover:border-[var(--color-accent)] hover:shadow-md transition-all group/mat">
             <span class="text-sm font-bold text-text-main group-hover/mat:text-(--color-accent) truncate">{{ mat.nombre }}</span>
             <Download class="w-4 h-4 text-gray-400 group-hover/mat:text-(--color-accent) opacity-0 group-hover/mat:opacity-100" />
           </a>
        </div>
      </div>

      <div v-if="fase.resultados && fase.resultados.length > 0" class="mt-4 border-t border-orange-100/50 pt-4">
        <button @click="isExpandedResults = !isExpandedResults" class="flex items-center gap-2 text-sm font-bold text-(--color-accent) hover:opacity-80 transition-opacity">
          <Table class="w-4 h-4" />
          Cuadro de Honor y Resultados ({{ fase.resultados.length }})
          <ChevronDown class="w-4 h-4 transition-transform duration-300" :class="isExpandedResults ? 'rotate-180' : ''" />
        </button>

        <div v-show="isExpandedResults" class="mt-4 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="bg-orange-50 border-b border-orange-100 text-text-main font-bold">
              <tr>
                <th class="px-4 py-3 text-center w-24">Puesto</th>
                <th class="px-4 py-3">Cédula de Identidad</th>
                <th class="px-4 py-3 text-right">Nota Final</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(res, idx) in fase.resultados" :key="idx" class="hover:bg-orange-50/30 transition-colors" :class="{'bg-orange-50/20 font-bold': Number(idx) < 3}">
                <td class="px-4 py-4 text-center text-lg font-black" :class="Number(idx) === 0 ? 'text-yellow-500' : Number(idx) === 1 ? 'text-gray-400' : Number(idx) === 2 ? 'text-amber-700' : 'text-text-muted text-base'">
                  {{ Number(idx) < 3 ? '🏆' : '#' }}{{ res.posicion }}
                </td>
                <td class="px-4 py-4 font-medium text-text-main">{{ res.carnet }}</td>
                <td class="px-4 py-4 text-right font-bold text-(--color-accent)">{{ res.nota }} pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CardContent>
  </Card>
</template>