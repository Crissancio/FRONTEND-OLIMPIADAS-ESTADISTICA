<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{
  open: boolean
  title: string
  description: string
  confirmLabel: string
  confirmClass?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-80 flex items-center justify-center bg-black/50 p-4"
  >
    <Card class="w-full max-w-md border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <CardTitle class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-warning" />
          {{ title }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4 p-6">
        <p class="text-sm text-text-muted">{{ description }}</p>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="isLoading" @click="emit('cancel')">
            Cancelar
          </Button>
          <Button
            :class="confirmClass ?? 'bg-primary text-white hover:bg-primary-dark'"
            :disabled="isLoading"
            @click="emit('confirm')"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ confirmLabel }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>