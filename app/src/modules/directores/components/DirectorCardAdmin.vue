<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Phone, Edit2, Power, Trash2, X, Save, Circle } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = withDefaults(defineProps<{
  director: any 
  showActions?: boolean 
}>(), {
  showActions: true 
})

const emit = defineEmits<{
  (e: 'desvincular', id: number): void
  (e: 'eliminar', id: number): void
  (e: 'toggle-estado', director: any): void
  (e: 'guardar', id: number, data: any): void
}>()

// --- Lógica de Estado Visual ---
const esActivo = computed(() => props.director.estado !== 'INACTIVO')

// --- Manejo local de la edición ---
const isEditing = ref(false)
const editForm = ref({
  nombres: '',
  paterno: '',
  materno: '',
  telefono_1: '',
  telefono_2: ''
})

const activarEdicion = () => {
  editForm.value = {
    nombres: props.director.nombres,
    paterno: props.director.paterno,
    materno: props.director.materno || '',
    telefono_1: props.director.telefono_1 || '',
    telefono_2: props.director.telefono_2 || ''
  }
  isEditing.value = true
}

const guardarCambios = () => {
  emit('guardar', props.director.id_director, editForm.value)
  isEditing.value = false
}
</script>

<template>
  <Card class="shadow-sm transition-all border relative overflow-hidden" 
        :class="!esActivo ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-white border-blue-100'">
    
    <div class="absolute left-0 top-0 bottom-0 w-1" 
         :class="esActivo ? 'bg-green-500' : 'bg-red-500'"></div>

    <CardContent class="p-4">
      
      <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm"
           :class="esActivo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
        <Circle class="h-2 w-2 fill-current" />
        {{ esActivo ? 'ACTIVO' : 'INACTIVO' }}
      </div>

      <div v-if="!isEditing" class="flex items-start gap-4 mr-16">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner border"
             :class="esActivo ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-200 text-gray-500 border-gray-300'">
          <User class="h-6 w-6" />
        </div>

        <div class="flex-1 space-y-1">
          <p class="font-bold text-gray-800 text-sm leading-tight">
            {{ director.nombres }} {{ director.paterno }} {{ director.materno || '' }}
          </p>
          <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Phone class="h-3.5 w-3.5" />
            <span>{{ director.telefono_1 || 'Sin teléfono' }}</span>
            <span v-if="director.telefono_2" class="text-gray-300">|</span>
            <span v-if="director.telefono_2">{{ director.telefono_2 }}</span>
          </div>
        </div>
      </div>

      <div v-else class="space-y-2 pr-12">
        <input v-model="editForm.nombres" type="text" placeholder="Nombres" class="input-base w-full py-1.5 bg-white text-xs border-blue-200 focus:border-blue-500" />
        <div class="grid grid-cols-2 gap-2">
          <input v-model="editForm.paterno" type="text" placeholder="Paterno" class="input-base w-full py-1.5 bg-white text-xs border-blue-200" />
          <input v-model="editForm.materno" type="text" placeholder="Materno" class="input-base w-full py-1.5 bg-white text-xs border-blue-200" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <input v-model="editForm.telefono_1" type="text" placeholder="Teléfono 1" class="input-base w-full py-1.5 bg-white text-xs border-blue-200" />
          <input v-model="editForm.telefono_2" type="text" placeholder="Teléfono 2" class="input-base w-full py-1.5 bg-white text-xs border-blue-200" />
        </div>
      </div>

      <div v-if="showActions" class="mt-4 flex justify-end gap-1.5 border-t border-gray-100 pt-3">
        <template v-if="!isEditing">
          <Button variant="ghost" size="icon" class="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700" title="Editar Información" @click="activarEdicion">
            <Edit2 class="h-4.5 w-4.5" />
          </Button>
          
          <Button variant="ghost" size="icon" class="h-9 w-9" 
                  :class="!esActivo ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'" 
                  :title="!esActivo ? 'Dar de Alta' : 'Dar de Baja'" 
                  @click="emit('toggle-estado', director)">
            <Power class="h-4.5 w-4.5" />
          </Button>

          <Button variant="ghost" size="icon" class="h-9 w-9 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Desvincular del Colegio" @click="emit('desvincular', director.id_director)">
            <X class="h-4.5 w-4.5" />
          </Button>

          <Button variant="ghost" size="icon" class="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700" title="Eliminar Permanentemente" @click="emit('eliminar', director.id_director)">
            <Trash2 class="h-4.5 w-4.5" />
          </Button>
        </template>
        
        <template v-else>
          <Button variant="ghost" size="icon" class="h-9 w-9 text-green-600 hover:bg-green-50" title="Guardar Cambios" @click="guardarCambios">
            <Save class="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" class="h-9 w-9 text-gray-500 hover:bg-gray-100" title="Cancelar" @click="isEditing = false">
            <X class="h-5 w-5" />
          </Button>
        </template>
      </div>

    </CardContent>
  </Card>
</template>