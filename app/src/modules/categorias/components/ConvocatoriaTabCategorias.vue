<template>
  <Card class="border-gray-200 shadow-soft bg-white">
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-primary" /> Categorías Disponibles
        </CardTitle>
        <Button variant="accent" @click="openCreateModal" class="flex items-center gap-2">
          <Plus class="h-4 w-4" /> Nueva Categoría
        </Button>
      </div>
    </CardHeader>
    
    <CardContent class="space-y-3">
      <div v-if="categoriasStore.loading" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">
        Cargando grilla de categorías...
      </div>
      <div v-else-if="categoriasStore.error" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
        Error al resolver las categorías vinculadas al identificador del evento.
      </div>
      <div v-else-if="categoriasStore.categorias.length === 0" class="text-center py-8 text-text-muted text-sm">
        No se han configurado categorías para este despliegue educativo.
      </div>

      <div 
        v-for="item in categoriasStore.categorias" 
        :key="item.id_categoria" 
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-accent/40"
      >
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 text-base font-bold bg-primary/10 text-primary rounded-full flex items-center justify-center">
            {{ item.nombre_categoria.substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <p class="font-bold text-text-main text-sm md:text-base">{{ item.nombre_categoria }}</p>
            <div class="mt-1 flex items-center gap-2">
              <Badge variant="outline" class="border-info/20 bg-info/10 text-info px-2 py-0.5 text-xs">Curso: {{ item.curso }}º</Badge>
              <Badge variant="outline" class="border-secondary/20 bg-secondary/10 text-secondary px-2 py-0.5 text-xs">{{ item.nivel }}</Badge>
              <Badge :class="item.estado === 'LISTA' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'" class="px-2 py-0.5 text-xs font-semibold">
                {{ item.estado }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="openEditModal(item)" class="flex items-center gap-1">
            <Edit class="h-3.5 w-3.5" /> Editar
          </Button>
          <Button variant="outline" size="sm" @click="toggleState(item)" class="flex items-center gap-1">
            <Settings class="h-3.5 w-3.5" /> Cambiar Estado
          </Button>
          <Button variant="destructive" size="sm" @click="deleteCategory(item.id_categoria)">
            <Trash2 class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </CardContent>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl">
        <CardHeader>
          <CardTitle class="flex items-center justify-between text-base font-bold">
            <span>{{ isEditing ? 'Modificar Registro' : 'Registrar Nueva Categoría' }}</span>
            <Button variant="ghost" size="icon" @click="closeModal"><X class="h-4 w-4" /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Nombre Descriptivo</label>
            <input v-model="form.nombre_categoria" type="text" placeholder="Ej: Avanzado Primaria Computación" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1">Curso Académico (1-6)</label>
              <input v-model.number="form.curso" type="number" min="1" max="6" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1">Nivel Educativo</label>
              <select v-model="form.nivel" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="PRIMARIA">PRIMARIA</option>
                <option value="SECUNDARIA">SECUNDARIA</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" @click="closeModal">Cancelar</Button>
            <Button variant="default" @click="saveCategory" :disabled="categoriasStore.loading">
              {{ categoriasStore.loading ? 'Enviando...' : 'Guardar Datos' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookOpen, Plus, Trash2, Edit, X, Settings } from 'lucide-vue-next'
import { useCategoriasStore } from '../stores/categorias.store'
import type { CategoriaDTO } from '../types/categorias.api'

const props = defineProps<{ convocatoriaId: number }>()
const categoriasStore = useCategoriasStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)

const form = ref({
  nombre_categoria: '',
  curso: 1,
  nivel: 'SECUNDARIA' as 'PRIMARIA' | 'SECUNDARIA'
})

onMounted(() => {
  categoriasStore.fetchCategoriasPorConvocatoria(props.convocatoriaId)
})

function openCreateModal() {
  isEditing.value = false
  currentId.value = null
  form.value = { nombre_categoria: '', curso: 1, nivel: 'SECUNDARIA' }
  isModalOpen.value = true
}

function openEditModal(item: CategoriaDTO) {
  isEditing.value = true
  currentId.value = item.id_categoria
  form.value = { nombre_categoria: item.nombre_categoria, curso: item.curso, nivel: item.nivel }
  isModalOpen.value = true
}

function closeModal() { isModalOpen.value = false }

async function saveCategory() {
  if (!form.value.nombre_categoria.trim()) return
  try {
    if (isEditing.value && currentId.value !== null) {
      await categoriasStore.updateCategoria(currentId.value, { ...form.value })
    } else {
      await categoriasStore.createCategoria({
        id_convocatoria: props.convocatoriaId,
        ...form.value
      })
    }
    closeModal()
  } catch (err) { console.error(err) }
}

async function toggleState(item: CategoriaDTO) {
  const nextState = item.estado === 'BORRADOR' ? 'LISTA' : item.estado === 'LISTA' ? 'ELIMINADA' : 'BORRADOR'
  await categoriasStore.updateCategoriaEstado(item.id_categoria, nextState)
}

async function deleteCategory(id: number) {
  if (confirm('¿Desea aplicar una eliminación física de este nodo de categoría?')) {
    await categoriasStore.removeCategoriaFisica(id)
  }
}
</script>