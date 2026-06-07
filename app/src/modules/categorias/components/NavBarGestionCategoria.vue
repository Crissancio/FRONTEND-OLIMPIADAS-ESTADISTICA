<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'
import type { EstadoEntidad } from '@/modules/categorias/types/categorias.api'

const props = defineProps<{
  nombre: string
  curso: string
  grado: string
  estado: EstadoEntidad
  isLoading: boolean
  error: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <header class="sticky top-0 z-20 rounded-xl bg-primary p-4 shadow-soft">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="text-sm text-white font-bold">Gestión de Categoría</span>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-3">
      <Button variant="not_allowed" class="bg-transparent hover:bg-transparent hover:text-white " @click="emit('back')">
        <ArrowLeft class="h-4 w-4 hover:size-8" />
      </Button>
      <CategorySymbol :name="nombre" class="h-12 w-12 bg-gray-400 text-5xl text-white shadow-sm" />
      <div>
        <h1 class="font-heading text-2xl font-bold text-white">
          {{ isLoading ? 'Cargando...' : nombre }}
        </h1>
        <p v-if="error" class="mt-1 text-sm font-medium text-error">{{ error }}</p>
        <div class="mt-1 flex items-center gap-2">
          <Badge variant="not_allowed" class="border-secondary/20 bg-secondary/10 text-secondary">{{ curso }}° de {{ grado }}</Badge>
          <Badge
            variant="not_allowed"
            :class="{
              'border-success/20 bg-success/10 text-success': estado === 'LISTA',
              'border-warning/20 bg-warning/10 text-warning': estado === 'BORRADOR',
              'border-error/20 bg-error/10 text-error': estado === 'ELIMINADA',
            }"
          >
            {{ estado }}
          </Badge>
        </div>
      </div>
    </div>
  </header>
</template>