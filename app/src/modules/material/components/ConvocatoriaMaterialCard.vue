<script setup lang="ts">
import { ExternalLink, FileText, Video, Link as LinkIcon, Settings, Globe, EyeOff, FileEdit } from 'lucide-vue-next'
import type { MaterialDTO } from '@/modules/material/types/material.api'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{
  material: MaterialDTO
}>()

defineEmits(['admin'])

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  }).format(date)
}

const getIcon = (tipo: string) => {
  if (tipo.includes('VIDEO')) return Video
  if (tipo.includes('EXTERNO') || tipo === 'PAGINA_EXTERNA') return LinkIcon
  return FileText
}

const getWatermarkIcon = (estado: string) => {
  if (estado === 'PUBLICO') return Globe
  if (estado === 'OCULTO') return EyeOff
  return FileEdit
}

// Fonction qui mappe les états avec les classes Tailwind arbitraires (variables CSS)
const getStateClasses = (estado: string) => {
  if (estado === 'PUBLICO') {
    return {
      watermark: 'text-[var(--color-publicacion-publica)]',
      icon: 'text-[var(--color-publicacion-publica)] bg-[var(--color-publicacion-publica-soft)]',
      badge: 'text-[var(--color-publicacion-publica)] bg-[var(--color-publicacion-publica-soft)] border-[var(--color-publicacion-publica)]'
    }
  }
  if (estado === 'OCULTO') {
    return {
      watermark: 'text-[var(--color-publicacion-oculta)]',
      icon: 'text-[var(--color-publicacion-oculta)] bg-[var(--color-publicacion-oculta-soft)]',
      badge: 'text-[var(--color-publicacion-oculta)] bg-[var(--color-publicacion-oculta-soft)] border-[var(--color-publicacion-oculta)]'
    }
  }
  return {
    watermark: 'text-[var(--color-publicacion-borrador)]',
    icon: 'text-[var(--color-publicacion-borrador)] bg-[var(--color-publicacion-borrador-soft)]',
    badge: 'text-[var(--color-publicacion-borrador)] bg-[var(--color-publicacion-borrador-soft)] border-[var(--color-publicacion-borrador)]'
  }
}
</script>

<template>
  <div 
    :class="[
      'group relative flex flex-col rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] h-full overflow-hidden',
      material.estado === 'PUBLICO' ? 'bg-white' : 'bg-gray-100'
    ]"
  >
    <component 
      :is="getWatermarkIcon(material.estado)" 
      :class="[
        'absolute -right-4 top-1/2 -translate-y-1/2 h-28 w-28 opacity-10 pointer-events-none z-0 transition-transform duration-500 group-hover:scale-110',
        getStateClasses(material.estado).watermark
      ]"
    />
    
    <div class="p-4 flex-1 flex flex-col gap-3 relative z-10">
      <div class="flex items-start gap-3">
        <div 
          :class="[
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110',
            getStateClasses(material.estado).icon
          ]"
        >
          <component :is="getIcon(material.tipo_material)" class="h-5 w-5 transition-transform duration-300" />
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm text-text-main leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-primary" :title="material.nombre_material">
            {{ material.nombre_material }}
          </h4>
          <p class="text-[11px] text-text-muted mt-1 font-medium flex items-center gap-1">
            {{ formatDate(material.fecha_publicacion as string) }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2 mt-auto pt-2">
        <Badge variant="outline" class="text-[10px] font-semibold border-gray-200 text-text-muted bg-white/50">
          {{ material.tipo_material.replace('_', ' ') }}
        </Badge>
        
        <Badge 
          variant="outline" 
          :class="[
            'text-[10px] font-semibold px-1.5 border-opacity-30',
            getStateClasses(material.estado).badge
          ]"
        >
          {{ material.estado }}
        </Badge>
      </div>
    </div>

    <div class="border-t border-gray-200 flex p-2 gap-2 bg-gray-50/80 rounded-b-xl relative z-10 transition-colors duration-300 group-hover:bg-primary/[0.02]">
      <div class="w-1/2">
        <Button 
          variant="outline" 
          class="w-full text-xs h-8 flex justify-center items-center gap-1.5 bg-white hover:bg-gray-100 hover:text-primary transition-colors border-gray-200"
          @click="$emit('admin', material.id_material)"
        >
          <Settings class="h-3.5 w-3.5" /> Administrar
        </Button>
      </div>

      <a :href="material.enlace_acceso" target="_blank" class="w-1/2 block">
        <Button 
          variant="accent" 
          class="w-full text-xs h-8 flex justify-center items-center gap-1.5 bg-secondary hover:bg-secondary-dark text-white border-none shadow-sm transition-colors"
        >
          <ExternalLink class="h-3.5 w-3.5" /> Abrir
        </Button>
      </a>
    </div>
  </div>
</template>