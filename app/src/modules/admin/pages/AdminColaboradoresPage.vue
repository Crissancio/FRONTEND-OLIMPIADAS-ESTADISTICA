<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Search, Edit, Trash2, Mail } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { adminColaboradoresMock } from '@/modules/admin/data/admin.data'

const searchTerm = ref('')
const selectedCategory = ref('all')

const colaboradores = computed(() => {
  return adminColaboradoresMock.filter((item) => {
    const bySearch = item.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
    const byCategory = selectedCategory.value === 'all' || item.categoria === selectedCategory.value
    return bySearch && byCategory
  })
})

const categoryClass = (category: string) => {
  if (category === 'Personal') return 'bg-info/10 text-info border-info/20'
  if (category === 'Administrativo') return 'bg-secondary/10 text-secondary border-secondary/20'
  return 'bg-success/10 text-success border-success/20'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Comité y Colaboradores</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona el directorio mostrado en "Acerca de".</p>
      </div>
      <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2"><Plus class="h-4 w-4" />Añadir Miembro</Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="flex flex-col gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:flex-row">
          <div class="relative w-full sm:w-80">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchTerm" class="h-auto w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar por nombre..." />
          </div>
          <select v-model="selectedCategory" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-56 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Todas las categorías</option>
            <option value="Personal">Personal académico</option>
            <option value="Administrativo">Administrativo</option>
            <option value="Colaborador">Colaborador</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Miembro</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Categoría</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Contacto</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="col in colaboradores" :key="col.id" class="group transition-colors hover:bg-gray-50/50">
                <td class="px-6 py-4">
                  <p class="font-bold text-text-main">{{ col.nombre }}</p>
                  <p class="text-sm text-text-muted">{{ col.rol }}</p>
                </td>
                <td class="px-6 py-4">
                  <Badge variant="outline" :class="`border px-2 py-1 ${categoryClass(col.categoria)}`">{{ col.categoria }}</Badge>
                </td>
                <td class="px-6 py-4">
                  <a :href="`mailto:${col.correo}`" class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Mail class="h-3.5 w-3.5" />
                    {{ col.correo }}
                  </a>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-info"><Edit class="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-error"><Trash2 class="h-4 w-4" /></Button>
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
