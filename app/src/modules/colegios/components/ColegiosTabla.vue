<script setup lang="ts">
import { Eye, Settings, Users } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { ColegioResponseDTO } from '../types/colegios.api'

defineProps<{
  colegios: ColegioResponseDTO[]
}>()

const emit = defineEmits<{
  (e: 'ver-detalles', id: number): void
  (e: 'admin-colegio', id: number): void
  (e: 'admin-directores', id: number): void
}>()

const estadoClass = (estado: string) => {
  const map: Record<string, string> = {
    'REVISADO': 'bg-estado-revisado-soft text-estado-revisado border-estado-revisado/20',
    'RECHAZADO': 'bg-estado-rechazado-soft text-estado-rechazado border-estado-rechazado/20',
    'PENDIENTE': 'bg-estado-pendiente-soft text-estado-pendiente border-estado-pendiente/20',
    'INACTIVO': 'bg-estado-inactivo-soft text-estado-inactivo border-estado-inactivo/20'
  }
  return map[estado.toUpperCase()] || 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <thead class="border-b border-gray-200 bg-gray-50">
        <tr>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Cod / Nombre</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Ubicación</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Detalles</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
          <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="col in colegios" :key="col.id_colegio" class="group transition-colors hover:bg-gray-50/50">
          <td class="px-6 py-4">
            <p class="font-bold text-text-main">{{ col.nombre }}</p>
            <p class="text-xs text-text-muted">Código: {{ col.codigo }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-sm text-text-main">{{ col.municipio }}</p>
            <p class="text-xs text-text-muted">{{ col.departamento }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-sm text-text-main">{{ col.tipo }}</p>
            <p class="text-xs text-text-muted">{{ col.turno }}</p>
          </td>
          <td class="px-6 py-4">
            <Badge variant="outline" :class="`border px-2.5 py-1 ${estadoClass(col.estado)}`">
              {{ col.estado }}
            </Badge>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <Button @click="emit('ver-detalles', col.id_colegio)" variant="ghost" size="icon" title="Ver Detalles">
                <Eye class="h-4 w-4 text-text-muted hover:text-primary" />
              </Button>
              <Button @click="emit('admin-colegio', col.id_colegio)" variant="ghost" size="icon" title="Administrar Colegio">
                <Settings class="h-4 w-4 text-text-muted hover:text-secondary" />
              </Button>
              <Button @click="emit('admin-directores', col.id_colegio)" variant="ghost" size="icon" title="Administrar Directores">
                <Users class="h-4 w-4 text-text-muted hover:text-accent" />
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>