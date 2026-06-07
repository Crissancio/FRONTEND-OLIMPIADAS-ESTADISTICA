<script setup lang="ts">
import { ref } from 'vue'
import { X, AlertCircle } from 'lucide-vue-next'
import { useCategoriasStore } from '../stores/categorias.store'
import { categoriasService } from '../services/categorias.service'

import type { CategoriaDTO, CategoriaCreateDTO, CategoriaUpdateDTO, NivelEducativo } from '../types/categorias.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{ convocatoriaId: number }>()
const categoriasStore = useCategoriasStore()

const isOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Pestañas para el alfabeto
const categoryModalTab = ref<'upper' | 'lower'>('upper')

const categoryForm = ref({
  nameGreek: '',
  curso: 1,
  nivel: 'SECUNDARIA' as NivelEducativo
})

const GREEK_LETTERS = [
  { name: 'Alfa', upper: 'Α', lower: 'α' },
  { name: 'Beta', upper: 'Β', lower: 'β' },
  { name: 'Gamma', upper: 'Γ', lower: 'γ' },
  { name: 'Delta', upper: 'Δ', lower: 'δ' },
  { name: 'Épsilon', upper: 'Ε', lower: 'ε' },
  { name: 'Zeta', upper: 'Ζ', lower: 'ζ' },
  { name: 'Eta', upper: 'Η', lower: 'η' },
  { name: 'Theta', upper: 'Θ', lower: 'θ' },
  { name: 'Iota', upper: 'Ι', lower: 'ι' },
  { name: 'Kappa', upper: 'Κ', lower: 'κ' },
  { name: 'Lambda', upper: 'Λ', lower: 'λ' },
  { name: 'Mu', upper: 'Μ', lower: 'μ' },
  { name: 'Nu', upper: 'Ν', lower: 'ν' },
  { name: 'Xi', upper: 'Ξ', lower: 'ξ' },
  { name: 'Ómicron', upper: 'Ο', lower: 'ο' },
  { name: 'Pi', upper: 'Π', lower: 'π' },
  { name: 'Rho', upper: 'Ρ', lower: 'ρ' },
  { name: 'Sigma', upper: 'Σ', lower: 'σ' },
  { name: 'Tau', upper: 'Τ', lower: 'τ' },
  { name: 'Ípsilon', upper: 'Υ', lower: 'υ' },
  { name: 'Fi', upper: 'Φ', lower: 'φ' },
  { name: 'Ji', upper: 'Χ', lower: 'χ' },
  { name: 'Psi', upper: 'Ψ', lower: 'ψ' },
  { name: 'Omega', upper: 'Ω', lower: 'ω' }
]

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)

  const responseData =
    err?.response?.data ??
    err?.data ??
    err?.details ??
    null

  if (responseData) {
    errorMessage.value =
      responseData.error ||
      responseData.message ||
      responseData.detail ||
      fallbackMsg

    return
  }

  errorMessage.value =
    err?.message && !err.message.includes('status code')
      ? err.message
      : fallbackMsg
}

// Funciones expuestas para que el padre las llame
const openCreate = () => {
  isEditing.value = false
  currentId.value = null
  errorMessage.value = ''
  categoryModalTab.value = 'upper'
  categoryForm.value = { nameGreek: '', curso: 1, nivel: 'SECUNDARIA' }
  isOpen.value = true
}

const openEdit = (item: CategoriaDTO) => {
  isEditing.value = true
  currentId.value = item.id_categoria
  errorMessage.value = ''
  categoryModalTab.value = 'upper'
  
  categoryForm.value = {
    nameGreek: item.nombre_categoria,
    curso: item.curso,
    nivel: item.nivel as NivelEducativo
  }
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  errorMessage.value = ''
}

// Guardar
async function saveCategory() {
  if (!categoryForm.value.nameGreek) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    if (isEditing.value && currentId.value !== null) {
      const payload: CategoriaUpdateDTO = { 
        nombre_categoria: categoryForm.value.nameGreek, 
        curso: categoryForm.value.curso, 
        nivel: categoryForm.value.nivel 
      }
      const response = await categoriasService.actualizarCategoria(currentId.value, payload)
      if (response.data) {
        const index = categoriasStore.categorias.findIndex(c => c.id_categoria === currentId.value)
        if (index !== -1) categoriasStore.categorias[index] = response.data
      }
    } else {
      const payload: CategoriaCreateDTO = { 
        id_convocatoria: props.convocatoriaId, 
        nombre_categoria: categoryForm.value.nameGreek, 
        curso: categoryForm.value.curso, 
        nivel: categoryForm.value.nivel 
      }
      await categoriasStore.crearYAgregarCategoria(payload)
    }
    close()
  } catch (err) {
    extractError(err, 'No se pudo guardar la categoría.')
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
  <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl animate-fade-in">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <span>{{ isEditing ? 'Administrar Categoría' : 'Nueva Categoría' }}</span>
          <button @click="close" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent class="pt-4 space-y-4">
        
        <transition name="slide">
          <div v-if="errorMessage" class="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3 shadow-sm shrink-0">
            <AlertCircle class="h-4 w-4 text-danger shrink-0 mt-0.5 " />
            <div class="flex-1 min-w-0">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-danger">Error al guardar</h4>
              <p class="text-xs font-medium wrap-break-word whitespace-pre-wrap text-danger">{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = ''" class="text-danger/60 hover:text-danger-hover transition-colors shrink-0">
              <X class="h-3 w-3 text-danger" />
            </button>
          </div>
        </transition>

        <div class="flex rounded-lg border border-gray-200 bg-gray-50/50 p-1">
          <button
            @click="categoryModalTab = 'upper'"
            :class="['flex-1 rounded-md py-1.5 text-xs font-semibold transition-all', categoryModalTab === 'upper' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main']"
          >
            Mayúsculas
          </button>
          <button
            @click="categoryModalTab = 'lower'"
            :class="['flex-1 rounded-md py-1.5 text-xs font-semibold transition-all', categoryModalTab === 'lower' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main']"
          >
            Minúsculas
          </button>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-text-main">Símbolo de la Categoría <span class="text-error">*</span></label>
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-45 overflow-y-auto p-1 custom-scrollbar border border-gray-100 rounded-lg bg-gray-50/50">
            <button
              v-for="letra in GREEK_LETTERS"
              :key="letra.name"
              @click="categoryForm.nameGreek = letra.name"
              type="button"
              :class="[
                'flex flex-col items-center justify-center h-14 rounded-lg border transition-all duration-200 overflow-hidden',
                categoryForm.nameGreek === letra.name 
                  ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/50' 
                  : 'bg-white border-gray-200 text-text-muted hover:border-gray-300 hover:bg-gray-100 hover:text-text-main'
              ]"
            >
              <span class="text-lg font-bold leading-none mb-1">
                {{ categoryModalTab === 'upper' ? letra.upper : letra.lower }}
              </span>
              <span class="text-[9px] font-medium w-full text-center px-1 truncate leading-tight">{{ letra.name }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main">Nivel Educativo <span class="text-error">*</span></label>
            <select v-model="categoryForm.nivel" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all">
              <option value="PRIMARIA">Primaria</option>
              <option value="SECUNDARIA">Secundaria</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main">Curso <span class="text-error">*</span></label>
            <select v-model="categoryForm.curso" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all">
              <option :value="1">1º (Primero)</option>
              <option :value="2">2º (Segundo)</option>
              <option :value="3">3º (Tercero)</option>
              <option :value="4">4º (Cuarto)</option>
              <option :value="5">5º (Quinto)</option>
              <option :value="6">6º (Sexto)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <Button variant="outline" @click="close" :disabled="isSubmitting">Cancelar</Button>
          <Button 
            variant="accent" 
            @click="saveCategory" 
            :disabled="isSubmitting || !categoryForm.nameGreek"
          >
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>