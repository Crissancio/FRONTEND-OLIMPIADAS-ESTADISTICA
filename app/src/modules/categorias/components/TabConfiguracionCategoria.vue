<script setup lang="ts">
import { ref, watch } from 'vue'
import { Settings, Edit, XCircle, Save, Trash2, ArrowRight, Lock } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { categoriasService } from '@/modules/categorias/services/categorias.service'
import type { NivelEducativo, EstadoEntidad } from '@/modules/categorias/types/categorias.api'

interface CategoriaLocal {
  nombre: string
  curso: number
  grado: string
  estado: EstadoEntidad
}

const props = defineProps<{
  categoriaId: number
  categoria: CategoriaLocal
}>()

const emit = defineEmits<{
  (e: 'updated', data: CategoriaLocal): void
  (e: 'deleted'): void
  (e: 'error', msg: string): void
}>()

const isEditing = ref(false)
const isSaving = ref(false)
const isChangingEstado = ref(false)
const categoryModalTab = ref<'upper' | 'lower'>('upper')

const form = ref({
  nombre: props.categoria.nombre,
  curso: props.categoria.curso || 1,
  grado: props.categoria.grado as NivelEducativo
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

const startEdit = () => {
  form.value = {
    nombre: props.categoria.nombre,
    curso: props.categoria.curso,
    grado: props.categoria.grado as NivelEducativo
  }
  categoryModalTab.value = 'upper'
  isEditing.value = true
}

const cancelEdit = () => {
  form.value = {
    nombre: props.categoria.nombre,
    curso: props.categoria.curso,
    grado: props.categoria.grado as NivelEducativo
  }
  isEditing.value = false
}

const saveCategoria = async () => {
  if (!form.value.nombre) return
  isSaving.value = true
  try {
    await categoriasService.actualizarCategoria(props.categoriaId, {
      nombre_categoria: form.value.nombre.trim(),
      curso: form.value.curso,
      nivel: form.value.grado as NivelEducativo,
    })
    
    emit('updated', { 
      nombre: form.value.nombre, 
      curso: form.value.curso, 
      grado: form.value.grado,
      estado: props.categoria.estado
    })
    isEditing.value = false
  } catch {
    emit('error', 'No se pudo actualizar la categoría.')
  } finally {
    isSaving.value = false
  }
}

const deleteCategoria = async () => {
  try {
    await categoriasService.eliminarCategoriaFisica(props.categoriaId)
    emit('deleted')
  } catch {
    emit('error', 'No se pudo eliminar la categoría.')
  }
}

const estadoTransicion = (estado: EstadoEntidad): { nuevoEstado: EstadoEntidad; label: string; clase: string } | null => {
  if (estado === 'BORRADOR') return { nuevoEstado: 'LISTA', label: 'Publicar', clase: 'bg-success text-white hover:bg-success/90' }
  if (estado === 'LISTA') return { nuevoEstado: 'ELIMINADA', label: 'Archivar', clase: 'bg-error text-white hover:bg-error/90' }
  if (estado === 'ELIMINADA') return { nuevoEstado: 'LISTA', label: 'Restaurar', clase: 'bg-secondary text-white hover:bg-secondary/90' }
  return null
}

const cambiarEstado = async () => {
  const transicion = estadoTransicion(props.categoria.estado)
  if (!transicion) return
  isChangingEstado.value = true
  try {
    await categoriasService.cambiarEstadoCategoria(props.categoriaId, { estado: transicion.nuevoEstado })
    emit('updated', { ...props.categoria, estado: transicion.nuevoEstado })
  } catch {
    emit('error', 'No se pudo cambiar el estado de la categoría.')
  } finally {
    isChangingEstado.value = false
  }
}

const estadoBadgeClass = (estado: EstadoEntidad) => {
  if (estado === 'LISTA') return 'border-success/20 bg-success/10 text-success'
  if (estado === 'BORRADOR') return 'border-warning/20 bg-warning/10 text-warning'
  if (estado === 'ELIMINADA') return 'border-error/20 bg-error/10 text-error'
  return 'border-gray-200 bg-gray-100 text-text-muted'
}

watch(() => props.categoria, (newVal) => {
  if (!isEditing.value) {
    form.value = {
      nombre: newVal.nombre,
      curso: newVal.curso,
      grado: newVal.grado as NivelEducativo
    }
  }
}, { deep: true })
</script>

<template>
  <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
    <CardHeader class="border-b border-gray-200">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-accent" />Configuración de categoría
          </CardTitle>
          <p class="mt-1 text-sm text-text-muted">Edita los datos principales de la categoría.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          
          <template v-if="!isEditing">
            <Button 
              variant="outline" 
              class="flex items-center gap-2" 
              @click="startEdit"
              :disabled="categoria.estado === 'LISTA'"
              :title="categoria.estado === 'LISTA' ? 'No se puede editar una categoría publicada' : ''"
            >
              <Lock v-if="categoria.estado === 'LISTA'" class="h-4 w-4 text-text-muted" />
              <Edit v-else class="h-4 w-4" />
              Editar datos
            </Button>
          </template>
          <template v-else>
            <Button variant="outline" class="flex items-center gap-2" @click="cancelEdit" :disabled="isSaving">
              <XCircle class="h-4 w-4" />Cancelar
            </Button>
            <Button variant="accent" class="flex items-center gap-2" :disabled="isSaving || !form.nombre" @click="saveCategoria">
              <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <Save v-else class="h-4 w-4" />
              {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
            </Button>
          </template>

          <Button
            v-if="estadoTransicion(categoria.estado)"
            class="flex items-center gap-2"
            :class="estadoTransicion(categoria.estado)!.clase"
            :disabled="isChangingEstado"
            @click="cambiarEstado"
          >
            <span v-if="isChangingEstado" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <ArrowRight v-else class="h-4 w-4" />
            {{ isChangingEstado ? 'Procesando...' : estadoTransicion(categoria.estado)!.label }}
          </Button>

          <Button
            class="bg-danger text-white hover:bg-danger-hover flex items-center gap-2 disabled:opacity-50"
            @click="deleteCategoria"
          >
            <Trash2 class="h-4 w-4" />Eliminar
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-6 p-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-text-main">Estado actual:</span>
          <Badge variant="outline" :class="estadoBadgeClass(categoria.estado)">
            {{ categoria.estado }}
          </Badge>
        </div>
        <div v-if="categoria.estado === 'LISTA'" class="flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 px-3 py-1.5 rounded-md border border-warning/20">
          <Lock class="h-3.5 w-3.5" />
          Esta categoría está publicada y bloqueada para edición.
        </div>
      </div>

      <div v-if="!isEditing" class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Símbolo (Nombre)</label>
          <input
            :value="form.nombre"
            disabled
            class="h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-text-main font-medium"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Nivel Educativo</label>
          <input
            :value="form.grado"
            disabled
            class="h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-text-main font-medium capitalize"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Curso</label>
          <input
            :value="`${form.curso}º`"
            disabled
            class="h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-text-main font-medium"
          />
        </div>
      </div>

      <div v-else class="space-y-5 rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-inner transition-all animate-fade-in">
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-bold text-text-main">Símbolo de la Categoría <span class="text-error">*</span></label>
            <div class="flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                @click="categoryModalTab = 'upper'"
                :class="['px-3 py-1 text-xs font-semibold rounded-md transition-all', categoryModalTab === 'upper' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main']"
              >
                Mayúsculas
              </button>
              <button
                @click="categoryModalTab = 'lower'"
                :class="['px-3 py-1 text-xs font-semibold rounded-md transition-all', categoryModalTab === 'lower' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main']"
              >
                Minúsculas
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar border border-gray-200 rounded-lg bg-white">
            <button
              v-for="letra in GREEK_LETTERS"
              :key="letra.name"
              @click="form.nombre = letra.name"
              type="button"
              :class="[
                'flex flex-col items-center justify-center h-14 rounded-lg border transition-all duration-200 overflow-hidden',
                form.nombre === letra.name 
                  ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/50' 
                  : 'bg-white border-gray-100 text-text-muted hover:border-gray-300 hover:bg-gray-50 hover:text-text-main'
              ]"
            >
              <span class="text-lg font-bold leading-none mb-1">
                {{ categoryModalTab === 'upper' ? letra.upper : letra.lower }}
              </span>
              <span class="text-[9px] font-medium w-full text-center px-1 truncate leading-tight">{{ letra.name }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-primary/10">
          <div>
            <label class="mb-1.5 block text-sm font-bold text-text-main">Nivel Educativo <span class="text-error">*</span></label>
            <select v-model="form.grado" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm">
              <option value="PRIMARIA">Primaria</option>
              <option value="SECUNDARIA">Secundaria</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-bold text-text-main">Curso <span class="text-error">*</span></label>
            <select v-model="form.curso" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm">
              <option :value="1">1º (Primero)</option>
              <option :value="2">2º (Segundo)</option>
              <option :value="3">3º (Tercero)</option>
              <option :value="4">4º (Cuarto)</option>
              <option :value="5">5º (Quinto)</option>
              <option :value="6">6º (Sexto)</option>
            </select>
          </div>
        </div>

      </div>

    </CardContent>
  </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>