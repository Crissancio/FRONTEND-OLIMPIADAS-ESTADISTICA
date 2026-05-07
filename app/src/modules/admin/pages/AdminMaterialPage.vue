<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Search, Filter, PlayCircle, FileText, ListChecks, Edit, Trash2, ExternalLink, ScrollText } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { adminMaterialesMock, type AdminMaterial } from '@/modules/admin/data/admin.data'

const searchTerm = ref('')
const selectedType = ref('all')

const materiales = ref<AdminMaterial[]>([...adminMaterialesMock])

const filteredMaterials = computed(() => {
  return materiales.value.filter((item) => {
    const matchesSearch = item.nombre_material.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesType = selectedType.value === 'all' || item.tipo_material === selectedType.value
    return matchesSearch && matchesType
  })
})

const getTipoConfig = (tipo: AdminMaterial['tipo_material']) => {
  switch (tipo) {
    case 'VIDEO':
      return { color: 'bg-error/10 text-error border-error/20', icon: PlayCircle }
    case 'EXAMEN':
      return { color: 'bg-secondary/10 text-secondary border-secondary/20', icon: FileText }
    case 'SOLUCIONARIO':
      return { color: 'bg-success/10 text-success border-success/20', icon: ScrollText }
    case 'EJERCICIOS':
      return { color: 'bg-warning/10 text-warning border-warning/20', icon: ListChecks }
    default:
      return { color: 'bg-gray-100 text-text-muted border-gray-200', icon: FileText }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Gestión de Material</h1>
        <p class="mt-1 text-sm text-text-muted">Administra recursos académicos para estudiantes.</p>
      </div>
      <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Añadir Material
      </Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="flex flex-col items-center gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:flex-row">
          <div class="relative w-full sm:w-80">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input
              v-model="searchTerm"
              type="text"
              class="h-auto w-full rounded-md border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              placeholder="Buscar material..."
            />
          </div>
          <select v-model="selectedType" class="h-auto w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Tipo de material</option>
            <option value="VIDEO">Video</option>
            <option value="EXAMEN">Examen</option>
            <option value="SOLUCIONARIO">Solucionario</option>
            <option value="EJERCICIOS">Ejercicios</option>
            <option value="OTRO">Otro</option>
          </select>
          <Button variant="outline" class="h-auto w-full justify-center gap-2 py-2.5 sm:w-auto">
            <Filter class="h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Nombre y descripción</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Tipo</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Relación</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mat in filteredMaterials" :key="mat.id_material" class="group transition-colors hover:bg-gray-50/50">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-text-main">{{ mat.nombre_material }}</span>
                    <span class="mt-0.5 text-sm text-text-muted">{{ mat.descripcion }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Badge variant="outline" :class="`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-bold ${getTipoConfig(mat.tipo_material).color}`">
                    <component :is="getTipoConfig(mat.tipo_material).icon" class="h-3.5 w-3.5" />
                    {{ mat.tipo_material }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="secondary" class="border border-gray-200 bg-white text-xs font-bold text-text-muted">
                      {{ mat.nombreConvocatoria }}
                    </Badge>
                    <Badge v-if="mat.fase" variant="secondary" class="border border-gray-200 bg-white text-xs font-bold text-text-muted">
                      {{ mat.fase }}
                    </Badge>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-info">
                      <ExternalLink class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-primary">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-error">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 p-4 text-sm text-text-muted">
          <span>Mostrando {{ filteredMaterials.length }} de {{ materiales.length }} materiales</span>
          <div class="flex gap-1">
            <Button variant="outline" size="sm" class="border-gray-200 text-text-muted" disabled>Anterior</Button>
            <Button variant="outline" size="sm" class="border-gray-200 text-text-muted" disabled>Siguiente</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
