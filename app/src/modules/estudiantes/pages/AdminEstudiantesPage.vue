<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Eye, Edit, UserX, Download, Mail } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { adminEstudiantesMock } from '@/modules/admin/data/admin.data'

const searchTerm = ref('')
const selectedStatus = ref('all')
const selectedCourse = ref('all')

const estudiantes = computed(() => {
  return adminEstudiantesMock.filter((item) => {
    const source = `${item.nombres} ${item.apellidos} ${item.ci}`.toLowerCase()
    const bySearch = source.includes(searchTerm.value.toLowerCase())
    const byStatus = selectedStatus.value === 'all' || item.estado === selectedStatus.value
    const byCourse = selectedCourse.value === 'all' || item.curso === selectedCourse.value
    return bySearch && byStatus && byCourse
  })
})

const estadoClass = (estado: string) => {
  if (estado === 'Activo') return 'bg-success/10 text-success border-success/20'
  return 'bg-error/10 text-error border-error/20'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Directorio de Estudiantes</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona estudiantes inscritos en la plataforma.</p>
      </div>
      <div class="flex w-full gap-2 sm:w-auto">
        <Button variant="outline" class="h-auto flex-1 px-4 py-2.5 sm:flex-none flex items-center gap-2">
          <Mail class="h-4 w-4" />
          Masivo
        </Button>
        <Button class="h-auto flex-1 px-4 py-2.5 sm:flex-none flex items-center gap-2">
          <Download class="h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="flex flex-col gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:flex-row">
          <div class="relative w-full sm:w-80">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchTerm" class="h-auto w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar por CI, nombre o apellido..." />
          </div>
          <select v-model="selectedStatus" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <select v-model="selectedCourse" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Curso</option>
            <option value="4">4to</option>
            <option value="5">5to</option>
            <option value="6">6to</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estudiante</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">CI</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Colegio / curso</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="est in estudiantes" :key="est.id" class="group transition-colors hover:bg-gray-50/50">
                <td class="px-6 py-4">
                  <p class="font-bold text-text-main">{{ est.apellidos }}</p>
                  <p class="text-sm text-text-muted">{{ est.nombres }}</p>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-text-main">{{ est.ci }}</td>
                <td class="px-6 py-4">
                  <p class="text-sm text-text-main">{{ est.colegio }}</p>
                  <p class="text-xs text-text-muted">{{ est.curso }}to Sec. · {{ est.departamento }}</p>
                </td>
                <td class="px-6 py-4"><Badge variant="outline" :class="`border px-2 py-1 ${estadoClass(est.estado)}`">{{ est.estado }}</Badge></td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-primary"><Eye class="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-info"><Edit class="h-4 w-4" /></Button>
                    <Button v-if="est.estado === 'Activo'" variant="ghost" size="icon" class="text-text-muted hover:text-error"><UserX class="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 p-4 text-sm text-text-muted">
          <span>Mostrando {{ estudiantes.length }} de {{ adminEstudiantesMock.length }} estudiantes</span>
          <div class="flex gap-1">
            <Button variant="outline" size="sm" class="border-gray-200 text-text-muted" disabled>Anterior</Button>
            <Button variant="outline" size="sm" class="border-gray-200 text-text-muted" disabled>Siguiente</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
