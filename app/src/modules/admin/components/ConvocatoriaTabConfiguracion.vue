<template>
  <div class="space-y-6">
    <Card class="border-gray-200 shadow-soft bg-white">
      <CardHeader class="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <Settings class="h-5 w-5 text-primary" /> Parámetros y Fechas
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">Habilita la edición para actualizar el formulario y sincronizar la base de datos.</p>
        </div>
        <Button 
          :variant="isEditing ? 'default' : 'outline'" 
          size="sm" 
          @click="toggleEdit"
          class="flex items-center gap-1.5"
        >
          <Edit class="h-4 w-4" />
          {{ isEditing ? 'Cancelar' : 'Editar Datos' }}
        </Button>
      </CardHeader>
      
      <CardContent class="pt-6 space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Nombre Oficial</label>
            <input 
              v-model="form.nombre_convocatoria" 
              type="text" 
              :disabled="!isEditing"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Gestión Anual</label>
            <input 
              v-model.number="form.gestion" 
              type="number" 
              :disabled="!isEditing"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-text-main">Monto de Inscripción (Bs)</label>
            <input 
              v-model.number="form.monto_inscripcion" 
              type="number" 
              :disabled="!isEditing"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-bold text-text-main">Descripción General de la Convocatoria</label>
          <textarea 
            v-model="form.descripcion" 
            rows="4" 
            :disabled="!isEditing"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-4" :class="!isEditing ? 'opacity-70' : ''">
            <label class="mb-2 block text-sm font-semibold text-text-main">Cronograma de Olimpiadas</label>
            <div class="space-y-3">
              <div>
                <span class="text-xs text-text-muted font-medium">Fecha de Inicio</span>
                <input type="date" v-model="form.inicio_olimpiadas" :disabled="!isEditing" class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
              <div>
                <span class="text-xs text-text-muted font-medium">Fecha de Conclusión</span>
                <input type="date" v-model="form.fin_olimpiadas" :disabled="!isEditing" class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-4" :class="!isEditing ? 'opacity-70' : ''">
            <label class="mb-2 block text-sm font-semibold text-text-main">Fase de Inscripciones</label>
            <div class="space-y-3">
              <div>
                <span class="text-xs text-text-muted font-medium">Apertura de Sistema</span>
                <input type="date" v-model="form.fecha_inicio_inscripcion" :disabled="!isEditing" class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
              <div>
                <span class="text-xs text-text-muted font-medium">Cierre de Admisiones</span>
                <input type="date" v-model="form.fecha_fin_inscripcion" :disabled="!isEditing" class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="isEditing" class="flex justify-end pt-4 border-t">
          <Button variant="default" @click="saveChanges" class="flex items-center gap-1.5">
            <Save class="h-4 w-4" /> Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="border-red-200 bg-red-50/30 shadow-soft">
      <CardContent class="p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-text-main text-base">Controles Avanzados del Estado</h3>
          <p class="text-xs text-text-muted mt-0.5">Permite alternar visibilidad pública o dar de baja el evento en el sistema.</p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="border-gray-300 bg-white" @click="changeState('hide')">Ocultar</Button>
          <Button variant="destructive" size="sm" @click="changeState('cancel')">Cancelar Evento</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Edit, Save } from 'lucide-vue-next'
import { useConvocatoriasStore } from '@/modules/convocatorias/stores/convocatorias.store'
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'

const props = defineProps<{
  convocatoria: ConvocatoriaDTO
}>()

const convocatoriasStore = useConvocatoriasStore()
const isEditing = ref(false)

const form = ref({
  nombre_convocatoria: props.convocatoria.nombre_convocatoria,
  gestion: props.convocatoria.gestion,
  monto_inscripcion: props.convocatoria.monto_inscripcion || 0,
  descripcion: props.convocatoria.descripcion || '',
  inicio_olimpiadas: props.convocatoria.inicio_olimpiadas ? props.convocatoria.inicio_olimpiadas.substring(0, 10) : '',
  fin_olimpiadas: props.convocatoria.fin_olimpiadas ? props.convocatoria.fin_olimpiadas.substring(0, 10) : '',
  fecha_inicio_inscripcion: props.convocatoria.fecha_inicio_inscripcion ? props.convocatoria.fecha_inicio_inscripcion.substring(0, 10) : '',
  fecha_fin_inscripcion: props.convocatoria.fecha_fin_inscripcion ? props.convocatoria.fecha_fin_inscripcion.substring(0, 10) : ''
})

function toggleEdit() {
  isEditing.value = !isEditing.value
}

async function saveChanges() {
  try {
    await convocatoriasStore.updateConvocatoria(props.convocatoria.id_convocatoria, {
      nombre_convocatoria: form.value.nombre_convocatoria,
      gestion: form.value.gestion,
      descripcion: form.value.descripcion,
      monto_inscripcion: form.value.monto_inscripcion,
      inicio_olimpiadas: form.value.inicio_olimpiadas ? new Date(form.value.inicio_olimpiadas).toISOString() : null,
      fin_olimpiadas: form.value.fin_olimpiadas ? new Date(form.value.fin_olimpiadas).toISOString() : null,
      fecha_inicio_inscripcion: form.value.fecha_inicio_inscripcion ? new Date(form.value.fecha_inicio_inscripcion).toISOString() : null,
      fecha_fin_inscripcion: form.value.fecha_fin_inscripcion ? new Date(form.value.fecha_fin_inscripcion).toISOString() : null
    })
    isEditing.value = false
  } catch (e) {
    console.error(e)
  }
}

async function changeState(action: 'hide' | 'cancel') {
  if (action === 'hide') {
    await convocatoriasStore.hideConvocatoria(props.convocatoria.id_convocatoria)
  } else if (action === 'cancel') {
    if (confirm('¿Está seguro de cancelar definitivamente este evento?')) {
      await convocatoriasStore.cancelConvocatoria(props.convocatoria.id_convocatoria)
    }
  }
}
</script>