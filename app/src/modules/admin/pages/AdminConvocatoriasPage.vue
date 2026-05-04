<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, Search, Filter, Eye, Settings, FileText 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CreateConvocatoriaDialog from '@/modules/admin/components/CreateConvocatoriaDialog.vue'
import { useConvocatorias } from '@/modules/admin/composables/useConvocatorias'

const router = useRouter()
const isDialogOpen = ref(false)
const searchTerm = ref('')
const selectedStatus = ref('all')
const { convocatorias } = useConvocatorias()

const filteredConvocatorias = computed(() => {
  return convocatorias.value.filter((conv) => {
    const matchesSearch =
      conv.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      String(conv.gestion).includes(searchTerm.value)
    const matchesStatus = selectedStatus.value === 'all' || conv.estado === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const estadoClass = (estado: string) => {
  if (estado === 'Activa') return 'bg-success/10 text-success border-success/20'
  if (estado === 'Borrador') return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-heading font-bold text-text-main">Convocatorias</h1>
        <p class="text-text-muted text-sm mt-1">Gestiona las olimpiadas, fases y resultados.</p>
      </div>
      <Button 
        @click="isDialogOpen = true"
        class="bg-accent hover:bg-accent-dark text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Crear Convocatoria
      </Button>
    </div>

    <Card class="rounded-xl border-gray-200 shadow-soft overflow-hidden bg-white">
      <CardContent class="p-0">
        <!-- Toolbar -->
        <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50">
          <div class="relative w-full sm:w-80">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-text-muted" />
            </div>
            <input 
              v-model="searchTerm"
              type="text" 
              class="w-full pl-9 pr-4 py-2 border-gray-300 rounded-md leading-5 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors text-sm transition-colors" 
              placeholder="Buscar convocatoria..."
            />
          </div>
          <div class="w-full sm:w-auto">
            <select
              v-model="selectedStatus"
              class="w-full sm:w-44 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="Activa">Activa</option>
              <option value="Borrador">Borrador</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
          <Button variant="outline" class="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition-colors">
            <Filter class="w-4 h-4" />
            Filtros
          </Button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider">Nombre</th>
                <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider">Gestión</th>
                <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider">Inscritos</th>
                <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider">Estado</th>
                <th class="px-6 py-4 text-right font-bold text-xs uppercase text-text-muted tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="conv in filteredConvocatorias" :key="conv.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText class="w-5 h-5 text-primary" />
                    </div>
                    <span class="font-bold text-text-main">{{ conv.nombre }}</span>
                  </div>
                </td>
                 <td class="px-6 py-4 text-text-muted font-medium">{{ conv.gestion }}</td>
                 <td class="px-6 py-4 text-text-muted font-medium">{{ conv.inscritos }}</td>
                 <td class="px-6 py-4">
                   <Badge 
                    variant="outline"
                    :class="`px-2.5 py-1 rounded border ${estadoClass(conv.estado)}`"
                   >
                    <template v-if="conv.estado === 'Activa'">
                      <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse mr-1.5"></span>
                    </template>
                    {{ conv.estado }}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button 
                       variant="ghost" 
                       size="icon"
                       class="text-text-muted hover:text-primary hover:bg-primary/10"
                       title="Ver Detalles"
                       @click="router.push(`/admin/convocatoria/visualizar/${conv.id}`)"
                     >
                       <Eye class="w-4 h-4" />
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="icon"
                       class="text-text-muted hover:text-text-main hover:bg-gray-100"
                       title="Administrar"
                       @click="router.push(`/admin/convocatoria/${conv.id}/gestionar`)"
                     >
                       <Settings class="w-4 h-4" />
                     </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination placeholder -->
        <div class="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-text-muted bg-gray-50/50">
          <span>Mostrando {{ filteredConvocatorias.length }} de {{ convocatorias.length }} convocatorias</span>
          <div class="flex gap-1">
            <Button variant="outline" size="sm" class="text-text-muted border-gray-200" disabled>Anterior</Button>
            <Button variant="outline" size="sm" class="text-text-muted border-gray-200" disabled>Siguiente</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <CreateConvocatoriaDialog v-model:open="isDialogOpen" />
  </div>
</template>
