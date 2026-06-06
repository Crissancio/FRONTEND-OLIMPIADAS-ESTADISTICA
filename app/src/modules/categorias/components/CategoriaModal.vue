<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useCategoriasStore } from '../stores/categorias.store'
import { categoriasService } from '../services/categorias.service'

import type { CategoriaDTO, CategoriaCreateDTO, CategoriaUpdateDTO, NivelEducativo } from '../types/categorias.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import GreekLetterPicker from '@/shared/components/ui/molecules/GreekLetterPicker.vue'

const props = defineProps<{ convocatoriaId: number }>()
const categoriasStore = useCategoriasStore()

const isOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const categoryModalTab = ref<'greek' | 'custom'>('greek')
const isSubmitting = ref(false)

const categoryForm = ref({
  nameCustom: '',
  nameGreek: '',
  curso: 1,
  nivel: 'SECUNDARIA' as NivelEducativo
})

const GREEK_LETTERS = ['Alfa', 'Beta', 'Gamma', 'Delta', 'Épsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Ómicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Ípsilon', 'Fi', 'Ji', 'Psi', 'Omega']

// Funciones expuestas para que el padre las llame
const openCreate = () => {
  isEditing.value = false
  currentId.value = null
  categoryModalTab.value = 'greek'
  categoryForm.value = { nameCustom: '', nameGreek: '', curso: 1, nivel: 'SECUNDARIA' }
  isOpen.value = true
}

const openEdit = (item: CategoriaDTO) => {
  isEditing.value = true
  currentId.value = item.id_categoria
  
  const isGreek = GREEK_LETTERS.includes(item.nombre_categoria)
  
  categoryModalTab.value = isGreek ? 'greek' : 'custom'
  categoryForm.value = {
    nameCustom: isGreek ? '' : item.nombre_categoria,
    nameGreek: isGreek ? item.nombre_categoria : '',
    curso: item.curso,
    nivel: item.nivel as NivelEducativo
  }
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

// Guardar
async function saveCategory() {
  const finalName = categoryModalTab.value === 'custom' 
    ? categoryForm.value.nameCustom.trim() 
    : categoryForm.value.nameGreek

  if (!finalName) return
  isSubmitting.value = true

  try {
    if (isEditing.value && currentId.value !== null) {
      const payload: CategoriaUpdateDTO = { nombre_categoria: finalName, curso: categoryForm.value.curso, nivel: categoryForm.value.nivel }
      const response = await categoriasService.actualizarCategoria(currentId.value, payload)
      if (response.data) {
        const index = categoriasStore.categorias.findIndex(c => c.id_categoria === currentId.value)
        if (index !== -1) categoriasStore.categorias[index] = response.data
      }
    } else {
      const payload: CategoriaCreateDTO = { id_convocatoria: props.convocatoriaId, nombre_categoria: finalName, curso: categoryForm.value.curso, nivel: categoryForm.value.nivel }
      await categoriasStore.crearYAgregarCategoria(payload)
    }
    close()
  } catch (err) {
    console.error('Error al guardar categoría:', err)
  } finally {
    isSubmitting.value = false
  }
}

// Exponemos los métodos para abrir el modal
defineExpose({
  openCreate,
  openEdit
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl animate-fade-in">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold">
          <span>{{ isEditing ? 'Administrar Categoría' : 'Nueva Categoría' }}</span>
          <button @click="close" class="rounded-md p-1 text-text-muted hover:bg-gray-100">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent class="pt-4 space-y-4">
        <div class="flex rounded-lg border border-gray-200 bg-gray-50/50 p-1">
          <button
            @click="categoryModalTab = 'greek'"
            :class="['flex-1 rounded-md py-1.5 text-xs font-semibold transition-all', categoryModalTab === 'greek' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main']"
          >
            Símbolo Griego
          </button>
          <button
            @click="categoryModalTab = 'custom'"
            :class="['flex-1 rounded-md py-1.5 text-xs font-semibold transition-all', categoryModalTab === 'custom' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main']"
          >
            Nombre Personalizado
          </button>
        </div>

        <div class="min-h-[160px]">
          <div v-if="categoryModalTab === 'greek'" class="space-y-4 animate-fade-in">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-text-main">Selecciona una letra</label>
              <GreekLetterPicker v-model="categoryForm.nameGreek" />
            </div>
          </div>
          
          <div v-else class="space-y-4 animate-fade-in">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-text-main">Nombre de la categoría</label>
              <input
                v-model="categoryForm.nameCustom"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Ej: Avanzado, Junior, etc."
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main">Nivel Educativo</label>
            <select v-model="categoryForm.nivel" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value="PRIMARIA">Primaria</option>
              <option value="SECUNDARIA">Secundaria</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main">Curso</label>
            <select v-model="categoryForm.curso" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option :value="1">1º (Primero)</option>
              <option :value="2">2º (Segundo)</option>
              <option :value="3">3º (Tercero)</option>
              <option :value="4">4º (Cuarto)</option>
              <option :value="5">5º (Quinto)</option>
              <option :value="6">6º (Sexto)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button variant="outline" @click="close">Cancelar</Button>
          <Button 
            variant="accent" 
            @click="saveCategory" 
            :disabled="isSubmitting || (categoryModalTab === 'custom' ? !categoryForm.nameCustom.trim() : !categoryForm.nameGreek)"
          >
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>