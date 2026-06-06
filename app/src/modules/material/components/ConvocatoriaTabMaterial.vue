<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Plus, Upload } from 'lucide-vue-next'

import { materialesService } from '@/modules/material/services/material.service'
import type { MaterialDTO } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

// Dependencia del componente MaterialCard (asegúrate de que existe en esa ruta)
import MaterialCard from '@/modules/admin/components/MaterialCard.vue'
// El nuevo modal que acabamos de crear
import ConvocatoriaMaterialModal from './ConvocatoriaMaterialModal.vue'

const props = defineProps<{ convocatoriaId: number }>()

const isLoading = ref(true)
const materialesList = ref<MaterialDTO[]>([])
const loadError = ref('')

// Referencia al modal
const materialModalRef = ref<InstanceType<typeof ConvocatoriaMaterialModal> | null>(null)

const fetchMateriales = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    const res = await materialesService.obtenerPorConvocatoria(props.convocatoriaId)
    materialesList.value = res.data || []
  } catch (error) {
    loadError.value = 'Ocurrió un error al cargar los materiales.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMateriales()
})

const openCreateModal = () => {
  if (materialModalRef.value) {
    materialModalRef.value.openModal()
  }
}

// Lógica de Visibilidad
async function toggleVisibility(material: MaterialDTO) {
  try {
    if (material.estado === 'PUBLICO') {
      await materialesService.ocultarMaterial(material.id_material)
    } else {
      await materialesService.publicarMaterial(material.id_material)
    }
    await fetchMateriales() // Recargar lista para ver el cambio
  } catch (err) {
    console.error('Error al cambiar visibilidad:', err)
  }
}

// Lógica de Borrado
async function deleteResource(id: number) {
  if (confirm('¿Desea remover este recurso multimedia permanentemente de la convocatoria?')) {
    try {
      await materialesService.eliminarMaterial(id)
      await fetchMateriales() // Recargar lista
    } catch (err) {
      console.error('Error al eliminar material:', err)
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <Card class="border-gray-200 shadow-soft bg-white">
      <CardHeader class="border-b border-gray-100 pb-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle class="flex items-center gap-2 text-text-main">
              <FileText class="h-5 w-5 text-primary" />
              Material de Convocatoria
            </CardTitle>
            <p class="text-xs text-text-muted mt-1">
              Archivos, reglamentos, videos y enlaces relevantes para la olimpiada.
            </p>
          </div>
          <Button variant="accent" class="flex items-center gap-2" @click="openCreateModal">
            <Plus class="h-4 w-4" />
            Subir Material
          </Button>
        </div>
      </CardHeader>
      
      <CardContent class="pt-6">
        <div v-if="isLoading" class="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-text-muted text-center animate-pulse">
          Cargando repositorio de materiales...
        </div>

        <div v-else-if="loadError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error text-center">
          {{ loadError }}
        </div>

        <div v-else-if="materialesList.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center transition-colors hover:border-gray-300">
          <FileText class="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 class="text-sm font-bold text-text-main">Repositorio Vacío</h3>
          <p class="mt-1 text-xs text-text-muted max-w-sm mx-auto">
            Aún no se han subido documentos ni enlaces externos a esta convocatoria.
          </p>
          <Button variant="outline" size="sm" class="mt-5" @click="openCreateModal">
            <Upload class="mr-2 h-4 w-4" />Añadir el primer material
          </Button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MaterialCard
            v-for="mat in materialesList"
            :key="mat.id_material"
            :material="mat"
            @delete="deleteResource(mat.id_material)"
            @toggle-visibility="toggleVisibility(mat)"
          />
        </div>
      </CardContent>
    </Card>

    <ConvocatoriaMaterialModal 
      ref="materialModalRef" 
      :convocatoria-id="convocatoriaId"
      @refresh="fetchMateriales"
    />
  </div>
</template>