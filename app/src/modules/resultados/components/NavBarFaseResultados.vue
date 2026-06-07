<script setup lang="ts">
import { ArrowLeft, Eye, EyeOff, BookOpen } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { EstadoResultado } from '@/modules/resultados/types/resultados.api'

const props = defineProps<{
  nombreFase: string
  nombreCategoria: string
  estadoResultados: EstadoResultado | null
  totalResultados: number
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const estadoClass = (estado: EstadoResultado | null) => {
  if (estado === 'PUBLICADO') return 'border-success/20 bg-success/10 text-success'
  if (estado === 'OCULTO') return 'border-gray-300 bg-gray-100 text-text-muted'
  return 'border-warning/20 bg-warning/10 text-warning'
}

const estadoLabel = (estado: EstadoResultado | null) => {
  if (estado === 'PUBLICADO') return 'Publicados'
  if (estado === 'OCULTO') return 'Ocultos'
  if (estado === 'BORRADOR') return 'Borrador'
  return 'Sin resultados'
}
</script>

<template>
  <header class="sticky top-0 z-20 rounded-xl border border-gray-200 border-t-4 border-t-primary bg-white p-4 shadow-soft">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button variant="ghost" @click="emit('back')">
          <ArrowLeft class="h-4 w-4" />
          <span class="hidden sm:inline">Volver</span>
        </Button>
        <div class="h-4 w-px bg-gray-200" />
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary-dark">
            <BookOpen class="h-4 w-4 text-white" />
          </div>
          <div>
            <p class="text-xs text-text-muted">{{ nombreCategoria }}</p>
            <h1 class="font-heading text-base font-bold text-text-main leading-tight">
              {{ isLoading ? 'Cargando...' : nombreFase }}
            </h1>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Badge variant="outline" class="border-info/20 bg-info/10 text-info px-3 py-1">
          {{ totalResultados }} resultados
        </Badge>
        <Badge variant="outline" :class="estadoClass(estadoResultados)">
          <Eye v-if="estadoResultados === 'PUBLICADO'" class="mr-1 h-3 w-3" />
          <EyeOff v-else-if="estadoResultados === 'OCULTO'" class="mr-1 h-3 w-3" />
          {{ estadoLabel(estadoResultados) }}
        </Badge>
      </div>
    </div>
  </header>
</template>