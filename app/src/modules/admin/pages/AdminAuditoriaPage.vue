<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Download, Eye, Activity, Database, Key } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { adminAuditLogsMock } from '@/modules/admin/data/admin.data'

const searchTerm = ref('')
const moduleFilter = ref('all')
const actionFilter = ref('all')

const logs = computed(() => {
  return adminAuditLogsMock.filter((item) => {
    const bySearch = `${item.admin} ${item.accion}`.toLowerCase().includes(searchTerm.value.toLowerCase())
    const byModule = moduleFilter.value === 'all' || item.modulo === moduleFilter.value
    const byAction = actionFilter.value === 'all' || item.tipo === actionFilter.value
    return bySearch && byModule && byAction
  })
})

const iconByType = (type: string) => {
  if (type === 'critical') return Key
  if (type === 'create' || type === 'delete') return Database
  return Activity
}

const colorByType = (type: string) => {
  if (type === 'critical') return 'text-error'
  if (type === 'create') return 'text-success'
  if (type === 'delete') return 'text-error'
  if (type === 'update') return 'text-info'
  return 'text-text-muted'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Auditoría de Sistema</h1>
        <p class="mt-1 text-sm text-text-muted">Registro de acciones críticas realizadas en el panel.</p>
      </div>
      <Button variant="outline" class="h-auto px-4 py-2.5 flex items-center gap-2">
        <Download class="h-4 w-4" />
        Exportar Registro
      </Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="grid grid-cols-1 gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:grid-cols-4">
          <div class="relative">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchTerm" class="h-auto w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar usuario o acción..." />
          </div>
          <select v-model="moduleFilter" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Todos los módulos</option>
            <option value="Colegios">Colegios</option>
            <option value="Estudiantes">Estudiantes</option>
            <option value="Convocatorias">Convocatorias</option>
            <option value="Avisos">Avisos</option>
          </select>
          <select v-model="actionFilter" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Cualquier acción</option>
            <option value="create">Creación</option>
            <option value="update">Actualización</option>
            <option value="delete">Eliminación</option>
            <option value="critical">Crítica</option>
          </select>
          <input type="text" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Filtrar por fecha" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Timestamp</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Usuario</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Acción / módulo</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Descripción</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 font-mono text-sm">
              <tr v-for="log in logs" :key="log.id" class="group transition-colors hover:bg-gray-50/50">
                <td class="whitespace-nowrap px-6 py-4 text-text-muted">{{ log.fecha }}</td>
                <td class="px-6 py-4 font-sans font-bold text-text-main">{{ log.admin }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <component :is="iconByType(log.tipo)" class="h-4 w-4" :class="colorByType(log.tipo)" />
                    <div>
                      <p class="font-sans text-sm font-bold text-text-main">{{ log.accion }}</p>
                      <p class="font-sans text-xs text-text-muted">{{ log.modulo }}</p>
                    </div>
                  </div>
                </td>
                <td class="max-w-xs truncate px-6 py-4 text-text-muted">{{ log.descripcion }}</td>
                <td class="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" class="text-text-muted hover:text-primary"><Eye class="h-4 w-4" /></Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
