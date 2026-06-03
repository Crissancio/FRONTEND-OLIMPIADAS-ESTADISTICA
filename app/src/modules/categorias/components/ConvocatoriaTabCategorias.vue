<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookOpen, Plus, Trash2, Edit, X, Settings } from 'lucide-vue-next'
import { useCategoriasStore } from '../stores/categorias.store'
import type { CategoriaDTO } from '../types/categorias.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'
import GreekLetterPicker from '@/shared/components/ui/molecules/GreekLetterPicker.vue'

const props = defineProps<{ convocatoriaId: number }>()
const categoriasStore = useCategoriasStore()

// Estados del modal y formulario
const isModalOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const categoryModalTab = ref<'greek' | 'custom'>('greek')

const categoryForm = ref({
  nameCustom: '',
  nameGreek: '',
  curso: 1,
  nivel: 'SECUNDARIA' as 'PRIMARIA' | 'SECUNDARIA'
})

onMounted(() => {
  categoriasStore.fetchCategoriasPorConvocatoria(props.convocatoriaId)
})

function openCreateCategoryModal() {
  isEditing.value = false
  currentId.value = null
  categoryModalTab.value = 'greek'
  categoryForm.value = {
    nameCustom: '',
    nameGreek: '',
    curso: 1,
    nivel: 'SECUNDARIA'
  }
  isModalOpen.value = true
}

function openEditCategoryModal(item: CategoriaDTO) {
  isEditing.value = true
  currentId.value = item.id_categoria
  // Inferir si el nombre es una letra griega
  const isGreek = ['Alfa', 'Beta', 'Gamma', 'Delta', 'Épsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Ómicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Ípsilon', 'Fi', 'Ji', 'Psi', 'Omega'].includes(item.nombre_categoria)
  
  categoryModalTab.value = isGreek ? 'greek' : 'custom'
  categoryForm.value = {
    nameCustom: isGreek ? '' : item.nombre_categoria,
    nameGreek: isGreek ? item.nombre_categoria : '',
    curso: item.curso,
    nivel: item.nivel as 'PRIMARIA' | 'SECUNDARIA'
  }
  isModalOpen.value = true
}

function closeCategoryModal() {
  isModalOpen.value = false
}

async function saveCategory() {
  const finalName = categoryModalTab.value === 'custom' 
    ? categoryForm.value.nameCustom.trim() 
    : categoryForm.value.nameGreek

  if (!finalName) return

  try {
    const payload = {
      id_convocatoria: props.convocatoriaId,
      nombre_categoria: finalName,
      curso: categoryForm.value.curso,
      nivel: categoryForm.value.nivel
    }

    if (isEditing.value && currentId.value !== null) {
      await categoriasStore.updateCategoria(currentId.value, payload)
    } else {
      await categoriasStore.createCategoria(payload)
    }
    
    closeCategoryModal()
    // Refrescamos explícitamente para asegurar sincronía
    await categoriasStore.fetchCategoriasPorConvocatoria(props.convocatoriaId)
  } catch (err) {
    console.error('Error al guardar categoría:', err)
  }
}

async function toggleState(item: CategoriaDTO) {
  const nextState = item.estado === 'BORRADOR' ? 'LISTA' : (item.estado === 'LISTA' ? 'ELIMINADA' : 'BORRADOR')
  await categoriasStore.updateCategoriaEstado(item.id_categoria, nextState)
}

async function deleteCategory(id: number) {
  if (confirm('¿Desea aplicar una eliminación física de esta categoría?')) {
    await categoriasStore.removeCategoriaFisica(id)
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'BORRADOR': return 'bg-warning/10 text-warning border-warning/20'
    case 'LISTA': return 'bg-success/10 text-success border-success/20'
    case 'ELIMINADA': return 'bg-error/10 text-error border-error/20'
    default: return 'bg-gray-100 text-text-muted border-gray-200'
  }
}
</script>

<template>
  <Card class="border-gray-200 shadow-soft bg-white">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <BookOpen class="h-5 w-5 text-primary" />
            Categorías Habilitadas
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">Configuración de niveles y grados de competencia.</p>
        </div>
        <Button variant="accent" class="flex items-center gap-2 h-9 text-xs px-3" @click="openCreateCategoryModal">
          <Plus class="h-3.5 w-3.5" />
          Nueva Categoría
        </Button>
      </div>
    </CardHeader>
    
    <CardContent class="pt-6">
      <div v-if="categoriasStore.loading" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted text-center animate-pulse">
        Sincronizando categorías...
      </div>
      
      <div v-else-if="categoriasStore.error" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
        Error al cargar las categorías.
      </div>
      
      <div v-else-if="categoriasStore.categorias.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
        <BookOpen class="mx-auto h-8 w-8 text-gray-300" />
        <h3 class="mt-2 text-sm font-semibold text-text-main">Sin categorías</h3>
        <p class="mt-1 text-xs text-text-muted">Aún no se han definido categorías para esta convocatoria.</p>
        <Button variant="outline" size="sm" class="mt-4" @click="openCreateCategoryModal">
          <Plus class="mr-2 h-4 w-4" />Crear primera categoría
        </Button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div 
          v-for="cat in categoriasStore.categorias" 
          :key="cat.id_categoria"
          class="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <CategorySymbol :name="cat.nombre_categoria" />
              <div>
                <h4 class="font-bold text-text-main">{{ cat.nombre_categoria }}</h4>
                <div class="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="outline" class="border-gray-200 text-text-muted text-[10px]">
                    {{ cat.nivel }}
                  </Badge>
                  <Badge variant="outline" class="border-gray-200 text-text-muted text-[10px]">
                    {{ cat.curso }}º Curso
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
                <button @click="openEditCategoryModal(cat)" class="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Editar">
                  <Edit class="h-3.5 w-3.5" />
                </button>
                <button @click="toggleState(cat)" class="p-1.5 text-text-muted hover:text-secondary hover:bg-secondary/10 rounded-md transition-colors" title="Cambiar Estado">
                  <Settings class="h-3.5 w-3.5" />
                </button>
                <button @click="deleteCategory(cat.id_categoria)" class="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors" title="Eliminar">
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
              <div class="text-right mt-1">
                <Badge variant="outline" :class="['text-[10px] font-semibold tracking-wide px-1.5 py-0', statusClass(cat.estado)]">
                  {{ cat.estado }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl animate-fade-in">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold">
          <span>{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</span>
          <button @click="closeCategoryModal" class="rounded-md p-1 text-text-muted hover:bg-gray-100">
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
          <Button variant="outline" @click="closeCategoryModal">Cancelar</Button>
          <Button 
            variant="accent" 
            @click="saveCategory" 
            :disabled="categoriasStore.loading || (categoryModalTab === 'custom' ? !categoryForm.nameCustom.trim() : !categoryForm.nameGreek)"
          >
            {{ categoriasStore.loading ? 'Guardando...' : 'Guardar' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>