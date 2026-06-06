<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, Trash2, EyeOff, X } from 'lucide-vue-next'

import { convocatoriasService } from '@/modules/convocatorias/services/convocatorias.service'
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{ convocatoria: ConvocatoriaDTO }>()
const emit = defineEmits(['refresh'])
const router = useRouter()

const isModalOpen = ref(false)
const modalAction = ref<'delete' | 'hide' | null>(null)
const isProcessing = ref(false)
const errorMsg = ref('')

const openModal = (action: 'delete' | 'hide') => {
  modalAction.value = action
  errorMsg.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  modalAction.value = null
}

const confirmAction = async () => {
  if (!modalAction.value) return
  isProcessing.value = true
  errorMsg.value = ''

  try {
    if (modalAction.value === 'delete') {
      await convocatoriasService.eliminarConvocatoriaFisica(props.convocatoria.id_convocatoria)
      router.push('/admin/convocatorias')
    } else if (modalAction.value === 'hide') {
      await convocatoriasService.ocultarConvocatoria(props.convocatoria.id_convocatoria)
      emit('refresh')
      closeModal()
    }
  } catch (err: any) {
    const responseData = err.response?.data
    if (responseData) {
      errorMsg.value = responseData.error || responseData.message || (Array.isArray(responseData.detail) ? 'Datos incorrectos' : responseData.detail) || 'Error al procesar la solicitud.'
    } else {
      errorMsg.value = err.message || 'Error de conexión.'
    }
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <Card class="border-danger-border bg-white shadow-soft">
    <CardHeader class="border-b border-(--color-danger-soft-hover) pb-4">
      <CardTitle class="flex items-center gap-2 text-danger">
        <AlertTriangle class="h-5 w-5" /> Zona de Peligro
      </CardTitle>
      <p class="text-xs text-text-muted mt-1">Acciones irreversibles o restrictivas de la convocatoria.</p>
    </CardHeader>

    <CardContent class="pt-6 space-y-4">
      
      <div v-if="convocatoria.estado === 'PUBLICADA'" class="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-warning/20 bg-warning/5 gap-4">
        <div>
          <h4 class="font-bold text-sm text-text-main">Ocultar Convocatoria</h4>
          <p class="text-xs text-text-muted mt-1">
            Cambia el estado de la convocatoria a oculta. Los participantes no podrán verla temporalmente.
          </p>
        </div>
        <Button variant="outline" class="w-full sm:w-auto shrink-0 text-warning border-warning/30 hover:bg-warning/10 hover:border-warning/50" @click="openModal('hide')">
          <EyeOff class="h-4 w-4 mr-2" /> Ocultar
        </Button>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-danger-border bg-danger-soft gap-4 transition-colors">
        <div>
          <h4 class="font-bold text-sm text-text-main">Eliminar Convocatoria Permanentemente</h4>
          <p class="text-xs text-text-muted mt-1">
            Se eliminarán todos los registros asociados a esta convocatoria y la acción no podrá deshacerse.
          </p>
        </div>
        <Button variant="outline" class="w-full sm:w-auto shrink-0 text-danger border-danger-border hover:bg-(--color-danger-soft-hover) hover:border-danger-border-hover hover:text-danger-text-hover transition-all" @click="openModal('delete')">
          <Trash2 class="h-4 w-4 mr-2" /> Eliminar
        </Button>
      </div>
    </CardContent>

    <div v-if="isModalOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card class="w-full max-w-md border-danger-border bg-white shadow-2xl">
        <CardHeader class="border-b border-gray-100 pb-3">
          <CardTitle class="flex items-center justify-between text-base font-bold" :class="modalAction === 'delete' ? 'text-danger' : 'text-warning'">
            <div class="flex items-center gap-2">
              <AlertTriangle class="h-5 w-5" />
              <span>{{ modalAction === 'delete' ? 'Confirmar Eliminación' : 'Confirmar Ocultación' }}</span>
            </div>
            <button @click="closeModal" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
              <X class="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <CardContent class="pt-5 space-y-4">
          <p v-if="modalAction === 'delete'" class="text-sm font-medium text-text-main">
            ¿Está completamente seguro de eliminar esta convocatoria? Esta acción <strong class="text-danger">NO SE PUEDE DESHACER</strong> y perderá todas las configuraciones, categorías y materiales.
          </p>
          <p v-if="modalAction === 'hide'" class="text-sm font-medium text-text-main">
            ¿Desea ocultar esta convocatoria? Una vez oculta, los usuarios no podrán verla ni inscribirse, y <strong class="text-warning">no podrá reactivarla directamente desde aquí</strong>.
          </p>

          <div v-if="errorMsg" class="rounded-lg border p-3 text-xs font-semibold text-center wrap-break-word" :class="modalAction === 'delete' ? 'border-danger-border bg-danger-soft text-danger' : 'border-error/20 bg-error/10 text-error'">
            {{ errorMsg }}
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" @click="closeModal" :disabled="isProcessing">Cancelar</Button>
            <Button 
              v-if="modalAction === 'delete'"
              variant="outline" 
              class="border-danger-border bg-danger-soft text-danger hover:bg-danger-hover hover:text-white transition-colors"
              @click="confirmAction" 
              :disabled="isProcessing"
            >
              <span v-if="isProcessing" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
              {{ isProcessing ? 'Eliminando...' : 'Sí, Eliminar' }}
            </Button>
            <Button 
              v-if="modalAction === 'hide'"
              variant="outline" 
              class="border-warning/30 bg-warning/10 text-warning hover:bg-warning hover:text-white transition-colors"
              @click="confirmAction" 
              :disabled="isProcessing"
            >
              <span v-if="isProcessing" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
              {{ isProcessing ? 'Ocultando...' : 'Sí, Ocultar' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Card>
</template>