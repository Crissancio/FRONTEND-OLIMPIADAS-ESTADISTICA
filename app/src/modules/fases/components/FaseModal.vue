<script setup lang="ts">
import { ref, computed } from 'vue'
import { BookOpen, Trophy, AlertCircle, X } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

import { fasesService } from '@/modules/fases/services/fases.service'
import type { 
  FaseUnionDTO, 
  TipoFase, 
  ModalidadFase,
  FasePreparacionCreateDTO,
  FasePreparacionUpdateDTO,
  FasePruebaCreateDTO,
  FasePruebaUpdateDTO
} from '@/modules/fases/types/fases.api'

const props = defineProps<{
  categoriaId: number
  fases: FaseUnionDTO[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const isOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const currentId = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const minGlobalDate = ref(new Date(Date.now() + 10 * 60000)) // +10 minutos

const form = ref({
  tipo: 'PREPARACION' as TipoFase,
  nombre: '',
  descripcion: '',
  modalidad: 'VIRTUAL' as ModalidadFase,
  fecha_inicio: new Date(),
  fecha_fin: new Date(),
  fecha_realizacion: new Date(),
  criterioAprobacion: 51,
  lugarRealizacion: '',
  faseAnteriorId: '' as number | ''
})

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const initializeDates = () => {
  const now = new Date()
  minGlobalDate.value = new Date(now.getTime() + 10 * 60000)
  
  const defaultStart = new Date(now.getTime() + 15 * 60000) 
  const defaultEnd = new Date(now.getTime() + 75 * 60000)
  
  return { defaultStart, defaultEnd }
}

const openCreate = () => {
  const { defaultStart, defaultEnd } = initializeDates()
  
  isEditing.value = false
  currentId.value = null
  errorMessage.value = null
  form.value = {
    tipo: 'PREPARACION',
    nombre: '',
    descripcion: '',
    modalidad: 'VIRTUAL',
    fecha_inicio: defaultStart,
    fecha_fin: defaultEnd,
    fecha_realizacion: defaultStart,
    criterioAprobacion: 51,
    lugarRealizacion: '',
    faseAnteriorId: ''
  }
  isOpen.value = true
}

const openEdit = (fase: FaseUnionDTO) => {
  initializeDates()
  isEditing.value = true
  currentId.value = fase.id_fase
  errorMessage.value = null
  
  form.value = {
    tipo: fase.tipo_fase,
    nombre: fase.nombre_fase,
    descripcion: fase.descripcion || '',
    modalidad: fase.modalidad,
    fecha_inicio: fase.tipo_fase === 'PREPARACION' ? new Date(fase.fecha_inicio) : new Date(),
    fecha_fin: fase.tipo_fase === 'PREPARACION' ? new Date(fase.fecha_fin) : new Date(),
    fecha_realizacion: fase.tipo_fase === 'PRUEBA' ? new Date(fase.fecha_realizacion) : new Date(),
    criterioAprobacion: fase.tipo_fase === 'PRUEBA' ? fase.criterio_aprobacion : 51,
    lugarRealizacion: fase.tipo_fase === 'PRUEBA' ? (fase.lugar_realizacion || '') : '',
    faseAnteriorId: fase.tipo_fase === 'PRUEBA' && fase.id_fase_anterior ? fase.id_fase_anterior : ''
  }
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  errorMessage.value = null
}

const fasesPruebaDisponibles = computed(() => {
  return props.fases.filter(f => f.tipo_fase === 'PRUEBA' && f.id_fase !== currentId.value)
})

const minFechaFin = computed(() => {
  return form.value.fecha_inicio 
    ? new Date(form.value.fecha_inicio.getTime() + 5 * 60000) // Mínimo 5 min después del inicio
    : minGlobalDate.value
})

const isFormValid = computed(() => {
  if (!form.value.nombre.trim()) return false
  
  if (form.value.tipo === 'PREPARACION') {
    if (!form.value.fecha_inicio || !form.value.fecha_fin) return false
    if (form.value.fecha_fin <= form.value.fecha_inicio) return false
  } else {
    if (!form.value.fecha_realizacion) return false
    if (form.value.criterioAprobacion < 0 || form.value.criterioAprobacion > 100) return false
  }
  return true
})

const handleSave = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  errorMessage.value = null

  try {
    if (form.value.tipo === 'PREPARACION') {
      if (isEditing.value && currentId.value) {
        const payload: FasePreparacionUpdateDTO = {
          nombre_fase: form.value.nombre,
          descripcion: form.value.descripcion,
          modalidad: form.value.modalidad,
          fecha_inicio: form.value.fecha_inicio.toISOString(),
          fecha_fin: form.value.fecha_fin.toISOString()
        }
        await fasesService.actualizarFasePreparacion(currentId.value, payload)
      } else {
        const payload: FasePreparacionCreateDTO = {
          id_categoria_fk: props.categoriaId,
          nombre_fase: form.value.nombre,
          descripcion: form.value.descripcion,
          modalidad: form.value.modalidad,
          fecha_inicio: form.value.fecha_inicio.toISOString(),
          fecha_fin: form.value.fecha_fin.toISOString()
        }
        await fasesService.crearFasePreparacion(payload)
      }
    } else {
      if (isEditing.value && currentId.value) {
        const payload: FasePruebaUpdateDTO = {
          nombre_fase: form.value.nombre,
          descripcion: form.value.descripcion,
          modalidad: form.value.modalidad,
          criterio_aprobacion: form.value.criterioAprobacion,
          fecha_realizacion: form.value.fecha_realizacion.toISOString(),
          lugar_realizacion: form.value.lugarRealizacion,
          id_fase_anterior: form.value.faseAnteriorId ? Number(form.value.faseAnteriorId) : null
        }
        await fasesService.actualizarFasePrueba(currentId.value, payload)
      } else {
        const payload: FasePruebaCreateDTO = {
          id_categoria_fk: props.categoriaId,
          nombre_fase: form.value.nombre,
          descripcion: form.value.descripcion,
          modalidad: form.value.modalidad,
          criterio_aprobacion: form.value.criterioAprobacion,
          fecha_realizacion: form.value.fecha_realizacion.toISOString(),
          lugar_realizacion: form.value.lugarRealizacion,
          id_fase_anterior: form.value.faseAnteriorId ? Number(form.value.faseAnteriorId) : null
        }
        await fasesService.crearFasePrueba(payload)
      }
    }

    emit('refresh')
    close()
  } catch (error) {
    extractError(error, 'No se pudo guardar la fase. Verifica los datos ingresados.')
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({ openCreate, openEdit, close })
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
  >
    <Card class="w-full max-w-3xl border-gray-200 bg-white shadow-xl animate-fade-in my-auto">
      <CardHeader class="border-b border-gray-100 pb-4">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <span>{{ isEditing ? 'Editar Fase' : 'Crear Nueva Fase' }}</span>
          <button @click="close" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-5 pt-4">
        
        <transition name="slide">
          <div v-if="errorMessage" class="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3 shadow-sm">
            <AlertCircle class="h-4 w-4 text-danger shrink-0 mt-0.5 " />
            <div class="flex-1 min-w-0">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-danger">Error</h4>
              <p class="text-xs font-medium whitespace-pre-wrap text-danger">{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = null" class="text-danger/60 hover:text-danger-hover transition-colors shrink-0">
              <X class="h-3 w-3 text-danger" />
            </button>
          </div>
        </transition>

        <div class="relative rounded-xl border border-gray-200 bg-gray-50 p-1 max-w-sm mx-auto">
          <div
            class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg shadow-sm transition-all duration-300 ease-out"
            :class="form.tipo === 'PREPARACION' ? 'translate-x-0 bg-secondary' : 'translate-x-full bg-accent'"
          />
          <div class="relative grid grid-cols-2 gap-1">
            <button
              type="button"
              :disabled="isEditing"
              class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              :class="form.tipo === 'PREPARACION' ? 'text-white' : 'text-text-muted hover:text-primary'"
              @click="form.tipo = 'PREPARACION'"
            >
              <BookOpen class="h-4 w-4" />
              Preparación
            </button>
            <button
              type="button"
              :disabled="isEditing"
              class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              :class="form.tipo === 'PRUEBA' ? 'text-primary' : 'text-text-muted hover:text-primary'"
              @click="form.tipo = 'PRUEBA'"
            >
              <Trophy class="h-4 w-4" />
              Prueba
            </button>
          </div>
        </div>

        <p v-if="isEditing" class="text-center text-[11px] font-medium text-text-muted -mt-2">
          El tipo de fase no se puede cambiar al editar.
        </p>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Nombre de la Fase <span class="text-error">*</span></label>
          <input
            v-model="form.nombre"
            placeholder="Ej: Clasificatorias Nacionales"
            class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Modalidad <span class="text-error">*</span></label>
            <select
              v-model="form.modalidad"
              class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            >
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="SEMIPRESENCIAL">Semipresencial</option>
            </select>
          </div>

          <template v-if="form.tipo === 'PRUEBA'">
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Criterio aprobación (%) <span class="text-error">*</span></label>
              <input
                v-model.number="form.criterioAprobacion"
                type="number"
                min="0"
                max="100"
                class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              />
            </div>
            
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Fase anterior</label>
              <select
                v-model="form.faseAnteriorId"
                class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              >
                <option value="">Ninguna / Primera Prueba</option>
                <option v-for="fase in fasesPruebaDisponibles" :key="fase.id_fase" :value="fase.id_fase">
                  {{ fase.nombre_fase }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Lugar realización</label>
              <input
                v-model="form.lugarRealizacion"
                class="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
                placeholder="Ej: Coliseo Central / Zoom"
              />
            </div>
          </template>
        </div>

        <!-- Seccion Calendarios (Más fit y balanceada) -->
        <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <div v-if="form.tipo === 'PREPARACION'" class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-semibold text-text-main">Inicio de Preparación <span class="text-error">*</span></label>
              <VDatePicker
                v-model="form.fecha_inicio"
                mode="dateTime"
                is24hr
                locale="es"
                :first-day-of-week="2"
                :min-date="minGlobalDate"
                expanded
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-semibold text-text-main">Fin de Preparación <span class="text-error">*</span></label>
              <VDatePicker
                v-model="form.fecha_fin"
                mode="dateTime"
                is24hr
                locale="es"
                :first-day-of-week="2"
                :min-date="minFechaFin"
                expanded
              />
            </div>
          </div>
          
          <div v-else class="max-w-sm mx-auto">
            <label class="mb-2 block text-sm font-semibold text-text-main">Fecha y Hora de la Prueba <span class="text-error">*</span></label>
            <VDatePicker
              v-model="form.fecha_realizacion"
              mode="dateTime"
              is24hr
              locale="es"
              :first-day-of-week="2"
              :min-date="minGlobalDate"
              expanded
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
          <textarea
            v-model="form.descripcion"
            placeholder="Instrucciones, temarios o detalles adicionales..."
            class="min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>

        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" @click="close" :disabled="isSubmitting">Cancelar</Button>
          <Button variant="accent" @click="handleSave" :disabled="!isFormValid || isSubmitting">
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Fase') }}
          </Button>
        </div>

      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
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