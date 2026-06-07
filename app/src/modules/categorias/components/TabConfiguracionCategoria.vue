<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Edit, XCircle, Save, Trash2, ArrowRight } from 'lucide-vue-next'
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
  curso: string
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

const form = ref<CategoriaLocal>({ ...props.categoria })

const startEdit = () => {
  form.value = { ...props.categoria }
  isEditing.value = true
}

const cancelEdit = () => {
  form.value = { ...props.categoria }
  isEditing.value = false
}

const saveCategoria = async () => {
  isSaving.value = true
  try {
    await categoriasService.actualizarCategoria(props.categoriaId, {
      nombre_categoria: form.value.nombre.trim(),
      curso: Number(form.value.curso),
      nivel: form.value.grado as NivelEducativo,
    })
    emit('updated', { ...form.value })
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
            <Button variant="outline" class="flex items-center gap-2" @click="startEdit">
              <Edit class="h-4 w-4" />Editar datos
            </Button>
          </template>
          <template v-else>
            <Button variant="outline" class="flex items-center gap-2" @click="cancelEdit">
              <XCircle class="h-4 w-4" />Cancelar
            </Button>
            <Button variant="accent" class="flex items-center gap-2" :disabled="isSaving" @click="saveCategoria">
              <Save class="h-4 w-4" />{{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
            </Button>
          </template>

          <Button
            v-if="estadoTransicion(categoria.estado)"
            class="flex items-center gap-2"
            :class="estadoTransicion(categoria.estado)!.clase"
            :disabled="isChangingEstado"
            @click="cambiarEstado"
          >
            <ArrowRight class="h-4 w-4" />
            {{ isChangingEstado ? 'Cambiando...' : estadoTransicion(categoria.estado)!.label }}
          </Button>

          <Button
            class="bg-danger text-white hover:bg-danger-hover flex items-center gap-2"
            @click="deleteCategoria"
          >
            <Trash2 class="h-4 w-4" />Eliminar
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-5 p-6">
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold text-text-main">Estado actual:</span>
        <Badge variant="outline" :class="estadoBadgeClass(categoria.estado)">
          {{ categoria.estado }}
        </Badge>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-bold text-text-main">Nombre</label>
          <input
            v-model="form.nombre"
            :disabled="!isEditing"
            class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Curso</label>
          <input
            v-model="form.curso"
            :disabled="!isEditing"
            class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Grado</label>
          <input
            v-model="form.grado"
            :disabled="!isEditing"
            class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>