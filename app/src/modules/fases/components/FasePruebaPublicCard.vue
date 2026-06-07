<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, Monitor, MapPin, ChevronDown, FileText, Video, Link as LinkIcon, File, GraduationCap, Table, ExternalLink} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{ fase: any }>()
const isExpandedMats = ref(false)
const isExpandedResults = ref(false)
</script>

<template>
  <Card class="relative bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:z-10 transition-all duration-300 overflow-hidden group">
    
    <GraduationCap class="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.25] text-(--color-primary) pointer-events-none group-hover:opacity-[0.3] transition-opacity duration-300" />
    
    <CardContent class="p-0 relative z-10">
      <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h4 class="text-2xl font-heading font-extrabold text-(--color-primary) uppercase tracking-wide">
          {{ fase.nombre }}
        </h4>
        <span class="text-sm font-semibold text-text-muted flex items-center gap-1.5">
          <Calendar class="w-4 h-4" />
          {{ fase.fechas }}
        </span>
      </div>
      
      <div class="flex flex-wrap gap-2 mb-4">
        <Badge variant="not_allowed" class="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-(--color-primary)/10 text-(--color-primary) border-(--color-primary)/20">
          {{ fase.tipo }}
        </Badge>
        <Badge v-if="fase.modalidad" variant="not_allowed" class="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
          <component :is="fase.modalidad === 'Virtual' ? Monitor : MapPin" class="w-3.5 h-3.5" />
          {{ fase.modalidad }}
        </Badge>
      </div>

      <p class="text-text-muted mb-6 text-base max-w-3xl leading-relaxed">{{ fase.descripcion }}</p>

      <div v-if="fase.materiales && fase.materiales.length > 0" class="mt-4 border-t border-gray-100 pt-4">
        <button @click="isExpandedMats = !isExpandedMats" class="flex items-center gap-2 text-sm font-bold text-text-main hover:text-(--color-primary) transition-colors">
          <FileText class="w-4 h-4" />
          Recursos de la evaluación ({{ fase.materiales.length }})
          <ChevronDown class="w-4 h-4 transition-transform duration-300" :class="isExpandedMats ? 'rotate-180' : ''" />
        </button>
        
        <div v-show="isExpandedMats" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a v-for="mat in fase.materiales" :key="mat.id" :href="mat.url" target="_blank" class="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-(--color-secondary) hover:bg-white hover:shadow-md transition-all group/mat">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-10 h-10 rounded-lg flex shrink-0 items-center justify-center bg-white shadow-sm border border-gray-100 text-(--color-secondary)">
                <component :is="mat.tipo === 'PDF' ? FileText : mat.tipo === 'Video' ? Video : mat.tipo === 'Documento' ? File : LinkIcon" class="w-5 h-5" />
              </div>
              <div class="truncate">
                <p class="text-sm font-bold text-text-main group-hover/mat:text-(--color-secondary) transition-colors truncate">{{ mat.nombre }}</p>
                <p class="text-xs text-text-muted">{{ mat.descripcion }}</p>
                <p class="text-xs text-text-muted font-bold">{{ mat.tipo }}</p>
              </div>
            </div>
            <ExternalLink class="w-5 h-5 text-gray-300 group-hover/mat:text-(--color-secondary) opacity-0 group-hover/mat:opacity-100 transition-all shrink-0 ml-2" />
          </a>
        </div>
      </div>

      <div v-if="fase.resultados && fase.resultados.length > 0" class="mt-4 border-t border-gray-100 pt-4">
        <button @click="isExpandedResults = !isExpandedResults" class="flex items-center gap-2 text-sm font-bold text-success hover:opacity-80 transition-opacity">
          <Table class="w-4 h-4" />
          Resultados publicados ({{ fase.resultados.length }})
          <ChevronDown class="w-4 h-4 transition-transform duration-300" :class="isExpandedResults ? 'rotate-180' : ''" />
        </button>

        <div v-show="isExpandedResults" class="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b border-gray-200 text-text-main font-bold">
              <tr>
                <th class="px-4 py-3 text-center w-24">Posición</th>
                <th class="px-4 py-3">Cédula de Identidad</th>
                <th class="px-4 py-3 text-right">Nota / Puntaje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(res, idx) in fase.resultados" :key="idx" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-4 py-3 text-center font-bold text-(--color-primary)">#{{ res.posicion }}</td>
                <td class="px-4 py-3 font-medium text-text-main">{{ res.carnet }}</td>
                <td class="px-4 py-3 text-right font-bold">{{ res.nota }} pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CardContent>
  </Card>
</template>