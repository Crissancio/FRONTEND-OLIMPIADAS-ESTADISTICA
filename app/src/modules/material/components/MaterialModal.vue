<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Upload } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { TipoMaterialEnum, MaterialDTO } from '@/modules/material/types/material.api'

type MaterialTabLocal = 'nuevo' | 'existente'

export interface NuevoMaterialForm {
  nombre: string
  tipo: TipoMaterialEnum
  enlace: string
}

const props = defineProps<{
  open: boolean
  existingMaterials: MaterialDTO[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-nuevo', form: NuevoMaterialForm): void
  (e: 'save-existentes', ids: number[]): void
}>()

const materialTab = ref<MaterialTabLocal>('nuevo')
const materialForm = ref<NuevoMaterialForm>({ nombre: '', tipo: 'DOCUMENTO', enlace: '' })
const selectedExisting = ref<number[]>([])

const reset = () => {
  materialTab.value = 'nuevo'
  materialForm.value = { nombre: '', tipo: 'DOCUMENTO', enlace: '' }
  selectedExisting.value = []
}

defineExpose({ reset })

const toggleExisting = (id: number) => {
  selectedExisting.value = selectedExisting.value.includes(id)
    ? selectedExisting.value.filter((item) => item !== id)
    : [...selectedExisting.value, id]
}

const handleSave = () => {
  if (materialTab.value === 'nuevo') {
    if (!materialForm.value.nombre) return
    emit('save-nuevo', { ...materialForm.value })
  } else {
    emit('save-existentes', [...selectedExisting.value])
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4"
  >
    <Card class="w-full max-w-2xl border-gray-200">
      <CardHeader>
        <CardTitle>Agregar Material</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-2">
          <button
            class="rounded-md px-3 py-2 text-sm font-semibold transition-colors"
            :class="materialTab === 'nuevo' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'"
            @click="materialTab = 'nuevo'"
          >
            Material Nuevo
          </button>
          <button
            class="rounded-md px-3 py-2 text-sm font-semibold transition-colors"
            :class="materialTab === 'existente' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-text-muted hover:bg-gray-50'"
            @click="materialTab = 'existente'"
          >
            Material Existente
          </button>
        </div>

        <div v-if="materialTab === 'nuevo'" class="space-y-3">
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Nombre *</label>
            <input
              v-model="materialForm.nombre"
              class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Tipo *</label>
            <select
              v-model="materialForm.tipo"
              class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            >
              <option value="EXAMEN">Examen</option>
              <option value="SOLUCIONARIO">Solucionario</option>
              <option value="EJERCICIOS">Ejercicios</option>
              <option value="DOCUMENTO">Documento</option>
              <option value="VIDEO_EXTERNO">Video</option>
              <option value="PAGINA_EXTERNA">Página externa</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Enlace</label>
            <input
              v-model="materialForm.enlace"
              class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              placeholder="https://..."
            />
          </div>
          <div
            class="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center text-sm text-text-muted cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload class="mx-auto mb-2 h-6 w-6 text-text-muted" />
            Subir archivo (opcional)
          </div>
        </div>

        <div v-else class="space-y-2">
          <div v-if="existingMaterials.length === 0" class="text-sm text-text-muted text-center py-4">
            No hay materiales disponibles.
          </div>
          <div
            v-for="item in existingMaterials"
            :key="item.id_material"
            class="cursor-pointer rounded-xl border p-3 transition-colors"
            :class="selectedExisting.includes(item.id_material) ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/40'"
            @click="toggleExisting(item.id_material)"
          >
            <p class="font-bold text-text-main">{{ item.nombre_material }}</p>
            <p class="text-xs text-text-muted mt-1">{{ item.descripcion ?? item.tipo_material }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <Button variant="outline" @click="emit('close')">Cancelar</Button>
          <Button variant="accent" class="flex items-center gap-2" @click="handleSave">
            <Plus class="h-4 w-4" />
            Agregar Material
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>