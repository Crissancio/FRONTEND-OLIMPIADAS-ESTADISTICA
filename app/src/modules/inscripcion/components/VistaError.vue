<template>
  <div class="flex flex-col items-center justify-center p-6 space-y-6 text-center animate-fade-in">
    <div class="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm">
      <XCircle class="w-14 h-14" />
    </div>
    <h2 class="text-2xl font-bold text-gray-800">No se pudo procesar la inscripción</h2>
    <p class="text-gray-600 max-w-md">{{ mensajeError }}</p>
    
    <Button @click="emitirRetorno" variant="outline" class="mt-4">
      <ArrowLeft class="w-5 h-5 mr-2" /> Volver al detalle de la convocatoria
    </Button>
  </div>
</template>

<script setup lang="ts">
import { XCircle, ArrowLeft } from 'lucide-vue-next'
// import { Button } from '@/components/ui/button'

defineProps<{
  mensajeError: string
}>()

const emit = defineEmits(['volver'])

const emitirRetorno = () => {
  emit('volver')
}
</script>