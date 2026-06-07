<script setup lang="ts">
import { ref } from 'vue'
import { Trophy, BookOpen, Clock, ChevronDown, ChevronUp, Upload, Edit, Trash2, File, Eye } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

// IMPORTAMOS EL ENUM CORRECTO
import type { TipoMaterialEnum } from '@/modules/material/types/material.api'

// ACTUALIZAMOS EL TIPO DE STRING A TipoMaterialEnum
export interface MaterialItem {
  id: string
  nombre: string
  tipo: TipoMaterialEnum 
  idMaterial?: number
}

export interface FaseItem {
  id: string
  nombre: string
  inicio: string
  fin: string
  descripcion: string
  tipo: 'preparacion' | 'prueba'
  modalidad: 'virtual' | 'presencial' | 'semipresencial'
  criterioAprobacion: number | null
  lugarRealizacion: string
  faseAnteriorId: string
  materiales: MaterialItem[]
}

const props = defineProps<{
  fase: FaseItem
  faseAnteriorNombre: string
}>()

const emit = defineEmits<{
  (e: 'edit', fase: FaseItem): void
  (e: 'delete', id: string): void
  (e: 'add-material', faseId: string): void
  (e: 'remove-material', faseId: string, materialId: string, idMaterial?: number): void
}>()

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// ACTUALIZAMOS EL PARÁMETRO AQUÍ TAMBIÉN
const materialTypeClass = (type: TipoMaterialEnum) => {
  if (type === 'VIDEO_EXTERNO') return 'bg-error/10 text-error border-error/20'
  if (type === 'DOCUMENTO' || type === 'DOCUMENTO_EXTERNO') return 'bg-success/10 text-success border-success/20'
  if (type === 'EJERCICIOS') return 'bg-warning/10 text-warning border-warning/20'
  if (type === 'PAGINA_EXTERNA') return 'bg-info/10 text-info border-info/20'
  if (type === 'EXAMEN') return 'bg-secondary/10 text-secondary border-secondary/20'
  if (type === 'SOLUCIONARIO') return 'bg-success/10 text-success border-success/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}
</script>

<template>
  <div class="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
    <div 
      class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors" 
      :class="fase.tipo === 'prueba' ? 'bg-accent' : 'bg-secondary'"
    ></div>

    <div class="flex flex-wrap items-center justify-between gap-4 p-4 pl-6">
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner border border-white/20"
          :class="fase.tipo === 'prueba' ? 'bg-linear-to-br from-accent to-accent-dark' : 'bg-linear-to-br from-secondary to-secondary-dark'"
        >
          <Trophy v-if="fase.tipo === 'prueba'" class="h-5 w-5 text-white" />
          <BookOpen v-else class="h-5 w-5 text-white" />
        </div>
        
        <div class="flex flex-col min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h4 class="font-bold text-base text-text-main truncate">{{ fase.nombre }}</h4>
            <Badge variant="outline" :class="fase.tipo === 'prueba' ? 'border-accent/20 bg-accent/10 text-accent-dark' : 'border-secondary/20 bg-secondary/10 text-secondary-dark'" class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {{ fase.tipo === 'prueba' ? 'Prueba' : 'Preparación' }}
            </Badge>
            <Badge variant="outline" class="border-gray-200 bg-gray-50 text-text-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {{ fase.modalidad }}
            </Badge>
          </div>
          <div class="flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <Clock class="h-3.5 w-3.5 opacity-70" />
            <span v-if="fase.tipo === 'preparacion'">{{ fase.inicio }} al {{ fase.fin }}</span>
            <span v-else>{{ fase.inicio }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" class="flex items-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 text-xs h-8" @click="$emit('add-material', fase.id)">
          <Upload class="h-3.5 w-3.5" /> Adjuntar Material
        </Button>
        <div class="h-6 w-px bg-gray-200 mx-1"></div>
        <button class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Editar Fase" @click="$emit('edit', fase)">
          <Edit class="h-4 w-4" />
        </button>
        <button class="p-1.5 text-gray-400 hover:text-danger hover:bg-danger-soft rounded-md transition-colors" title="Eliminar Fase" @click="$emit('delete', fase.id)">
          <Trash2 class="h-4 w-4" />
        </button>
        <button class="p-1.5 text-gray-400 hover:text-text-main hover:bg-gray-100 rounded-md transition-colors ml-1" @click="toggleExpand">
          <ChevronUp v-if="isExpanded" class="h-5 w-5" />
          <ChevronDown v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="border-t border-gray-100 bg-gray-50/50 p-4 pl-6">
      <p class="text-sm text-text-main leading-relaxed mb-4">{{ fase.descripcion || 'Sin descripción detallada.' }}</p>
      
      <div
        v-if="fase.tipo === 'prueba'"
        class="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm"
      >
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Criterio de Aprob.</span>
          <span class="font-semibold text-text-main flex items-center gap-1">
            {{ fase.criterioAprobacion ?? '0' }}%
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Lugar de Realización</span>
          <span class="font-semibold text-text-main truncate" :title="fase.lugarRealizacion || 'No especificado'">{{ fase.lugarRealizacion || 'No especificado' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Requiere aprobar</span>
          <span class="font-semibold text-text-main truncate" :title="faseAnteriorNombre">
            {{ faseAnteriorNombre }}
          </span>
        </div>
      </div>

      <div class="space-y-2">
        <h5 class="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
          <File class="h-3.5 w-3.5 text-primary" /> Materiales Adjuntos ({{ fase.materiales.length }})
        </h5>
        
        <div
          v-if="fase.materiales.length === 0"
          class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs font-medium text-text-muted"
        >
          No hay materiales asignados a esta fase.
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="material in fase.materiales"
            :key="material.id"
            class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm hover:border-primary/30 transition-colors group/mat"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="h-8 w-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover/mat:bg-primary/5 group-hover/mat:text-primary transition-colors">
                <File class="h-4 w-4 text-text-muted group-hover/mat:text-primary" />
              </div>
              <div class="min-w-0 flex flex-col">
                <p class="text-xs font-bold text-text-main truncate" :title="material.nombre">{{ material.nombre }}</p>
                <Badge variant="outline" :class="`border px-1.5 py-0 text-[9px] uppercase tracking-wider mt-0.5 w-fit ${materialTypeClass(material.tipo)}`">
                  {{ material.tipo.replace('_', ' ') }}
                </Badge>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Ver Material">
                <Eye class="h-3.5 w-3.5" />
              </button>
              <button
                class="p-1.5 text-text-muted hover:text-danger hover:bg-danger-soft rounded-md transition-colors"
                title="Desvincular Material"
                @click="$emit('remove-material', fase.id, material.id, material.idMaterial)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>