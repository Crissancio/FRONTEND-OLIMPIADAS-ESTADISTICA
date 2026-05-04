<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Globe, Eye, Edit, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { adminAvisosMock, type AdminAviso } from '@/modules/admin/data/admin.data'

const avisos = ref<AdminAviso[]>([...adminAvisosMock])
const tipoFilter = ref('all')
const estadoFilter = ref('all')

const filteredAvisos = computed(() => {
  return avisos.value.filter((item) => {
    const byType = tipoFilter.value === 'all' || item.tipo === tipoFilter.value
    const byStatus = estadoFilter.value === 'all' || item.estado === estadoFilter.value
    return byType && byStatus
  })
})

const tipoClass = (tipo: string) => {
  if (tipo === 'Urgente') return 'bg-error/10 text-error border-error/20'
  if (tipo === 'Importante') return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-info/10 text-info border-info/20'
}

const tipoIcon = (tipo: string) => {
  if (tipo === 'Urgente') return AlertCircle
  if (tipo === 'Importante') return CheckCircle
  return Info
}

const statusClass = (estado: string) => {
  if (estado === 'Publicado') return 'bg-success/10 text-success border-success/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}

const toggleEstado = (id: string) => {
  avisos.value = avisos.value.map((item) => {
    if (item.id !== id) return item
    return { ...item, estado: item.estado === 'Publicado' ? 'Borrador' : 'Publicado' }
  })
}

const removeAviso = (id: string) => {
  avisos.value = avisos.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Avisos y Comunicados</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona noticias mostradas en la página principal.</p>
      </div>
      <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2"><Plus class="h-4 w-4" />Redactar Aviso</Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="flex flex-wrap gap-4 border-b border-gray-200 bg-gray-50/50 p-4">
          <select v-model="tipoFilter" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Todos los tipos</option>
            <option value="Urgente">Urgente</option>
            <option value="Importante">Importante</option>
            <option value="Informacion">Información</option>
          </select>
          <select v-model="estadoFilter" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Cualquier estado</option>
            <option value="Publicado">Publicado</option>
            <option value="Borrador">Borrador</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Título</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Tipo</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Fecha</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="aviso in filteredAvisos" :key="aviso.id" class="group transition-colors hover:bg-gray-50/50">
                <td class="px-6 py-4">
                  <p class="font-bold text-text-main">{{ aviso.titulo }}</p>
                  <p class="mt-1 text-xs text-text-muted">{{ aviso.convocatoria }}</p>
                </td>
                <td class="px-6 py-4">
                  <Badge variant="outline" :class="`inline-flex items-center gap-1.5 border px-2 py-1 ${tipoClass(aviso.tipo)}`">
                    <component :is="tipoIcon(aviso.tipo)" class="h-3.5 w-3.5" />
                    {{ aviso.tipo }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <Badge variant="outline" :class="`px-2.5 py-1 border ${statusClass(aviso.estado)}`">
                    <span v-if="aviso.estado === 'Publicado'" class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success" />
                    {{ aviso.estado }}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-sm text-text-muted">{{ aviso.fecha }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-success" @click="toggleEstado(aviso.id)">
                      <Globe class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-primary"><Eye class="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-info"><Edit class="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" class="text-text-muted hover:text-error" @click="removeAviso(aviso.id)"><Trash2 class="h-4 w-4" /></Button>
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
