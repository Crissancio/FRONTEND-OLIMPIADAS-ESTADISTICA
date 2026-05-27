<script setup lang="ts">
import { computed } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import type { ColaboradorResponseDTO } from '@/modules/colaborador/types/colaboradores.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{
  colaborador: ColaboradorResponseDTO
}>()

const emit = defineEmits<{
  (e: 'click', id: number): void
}>()

const iniciales = computed(() => {
  const nombre = props.colaborador.nombres.charAt(0).toUpperCase()
  const apellido = props.colaborador.paterno.charAt(0).toUpperCase()
  return `${nombre}${apellido}`
})

const badgeVariant = computed(() => {
  switch (props.colaborador.tipo) {
    case 'PERSONAL ACADEMICO': return 'bg-[var(--color-estado-proxima-soft)] text-[var(--color-estado-proxima)] border-[var(--color-estado-proxima)]/20'
    case 'ADMINISTRATIVO': return 'bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)] border-[var(--color-estado-inscripcion)]/20'
    default: return 'bg-[var(--color-aviso-otro-soft)] text-[var(--color-aviso-otro)] border-[var(--color-aviso-otro)]/20'
  }
})
</script>

<template>
  <Card 
    class="group relative cursor-pointer overflow-hidden border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-soft hover:ring-2 hover:ring-primary/20"
    @click="emit('click', colaborador.id_colaborador)"
  >
    <CardContent class="flex flex-col items-center p-6 text-center">
      <button class="absolute right-4 top-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary">
        <MoreHorizontal class="h-5 w-5" />
      </button>

      <div class="mb-4 h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-gray-50">
        <img 
          v-if="colaborador.perfil" 
          :src="colaborador.perfil" 
          :alt="colaborador.nombres"
          class="h-full w-full object-cover"
        />
        <div 
          v-else 
          class="flex h-full w-full items-center justify-center bg-gray-100 text-xl font-bold text-gray-400"
        >
          {{ iniciales }}
        </div>
      </div>

      <h3 class="mb-1 font-heading text-lg font-bold text-text-main line-clamp-1">
        {{ colaborador.nombres }} {{ colaborador.paterno }}
      </h3>
      
      <p class="mb-3 text-sm font-medium text-text-muted line-clamp-1">
        {{ colaborador.rol }}
      </p>

      <Badge variant="outline" :class="['border px-2.5 py-1 text-xs font-semibold', badgeVariant]">
        {{ colaborador.tipo }}
      </Badge>

      <div class="mt-4 flex w-full items-center justify-center gap-2 border-t border-gray-100 pt-4">
        <span 
          :class="[
            'h-2 w-2 rounded-full',
            colaborador.estado === 'ACTIVO' ? 'bg-success' : 'bg-gray-400'
          ]"
        ></span>
        <span class="text-xs font-medium text-gray-500">
          {{ colaborador.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </CardContent>
  </Card>
</template>