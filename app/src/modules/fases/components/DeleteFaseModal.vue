<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

defineProps<{
  show: boolean
  isDeleting: boolean
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-110 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <Card class="w-full max-w-sm border-gray-200 bg-white shadow-2xl animate-fade-in text-center overflow-hidden">
      <div class="bg-danger-soft py-6 flex justify-center">
        <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Trash2 class="h-8 w-8 text-danger" />
        </div>
      </div>
      <div class="p-6">
        <h3 class="text-lg font-bold text-text-main mb-2">¿Eliminar Fase?</h3>
        <p class="text-sm text-text-muted mb-6 leading-relaxed">
          Esta acción es <strong class="text-text-main">irreversible</strong>. Se eliminará la fase por completo y se desvincularán todos los materiales asociados a ella del cronograma.
        </p>
        <div class="flex items-center gap-3">
          <Button variant="outline" class="flex-1" @click="$emit('cancel')" :disabled="isDeleting">Cancelar</Button>
          <Button variant="accent" class="flex-1 bg-danger hover:bg-danger-hover text-white border-transparent" @click="$emit('confirm')" :disabled="isDeleting">
            <span v-if="isDeleting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>