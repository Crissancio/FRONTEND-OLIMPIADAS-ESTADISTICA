<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Plus, Eye, Edit, RefreshCw, CheckCircle, XCircle } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { adminColegiosMock } from '@/modules/admin/data/admin.data'

const searchTerm = ref('')
const selectedStatus = ref('all')
const selectedDepartment = ref('all')

const colegios = computed(() => {
  return adminColegiosMock.filter((item) => {
    const bySearch = item.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
    const byStatus = selectedStatus.value === 'all' || item.estado === selectedStatus.value
    const byDepartment = selectedDepartment.value === 'all' || item.departamento === selectedDepartment.value
    return bySearch && byStatus && byDepartment
  })
})

const estadoClass = (estado: string) => {
  if (estado === 'Aprobado') return 'bg-success/10 text-success border-success/20'
  if (estado === 'Pendiente') return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-error/10 text-error border-error/20'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Directorio de Colegios</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona, aprueba y fusiona instituciones educativas.</p>
      </div>
      <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Añadir Colegio
      </Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="flex flex-col gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:flex-row">
          <div class="relative w-full sm:w-80">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchTerm" class="h-auto w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar por nombre..." />
          </div>
          <select v-model="selectedStatus" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Estado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
          </select>
          <select v-model="selectedDepartment" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Departamento</option>
            <option value="La Paz">La Paz</option>
            <option value="Cochabamba">Cochabamba</option>
            <option value="Santa Cruz">Santa Cruz</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Nombre</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Tipo y turno</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Departamento</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="col in colegios" :key="col.id" class="group transition-colors hover:bg-gray-50/50">
                <td class="px-6 py-4 font-bold text-text-main">{{ col.nombre }}</td>
                <td class="px-6 py-4">
                  <p class="text-sm text-text-main">{{ col.tipo }}</p>
                  <p class="text-xs text-text-muted">{{ col.turno }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-text-muted">{{ col.departamento }}</td>
                <td class="px-6 py-4">
                  <Badge variant="outline" :class="`border px-2.5 py-1 ${estadoClass(col.estado)}`">{{ col.estado }}</Badge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button v-if="col.estado === 'Pendiente'" variant="ghost" size="icon" class="text-success hover:bg-success/10"><CheckCircle class="h-4 w-4" /></Button>
                    <Button v-if="col.estado === 'Pendiente'" variant="ghost" size="icon" class="text-error hover:bg-error/10"><XCircle class="h-4 w-4" /></Button>
                    <Button v-if="col.estado === 'Pendiente'" variant="ghost" size="icon" class="text-secondary hover:bg-secondary/10"><RefreshCw class="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-primary"><Eye class="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-info"><Edit class="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
