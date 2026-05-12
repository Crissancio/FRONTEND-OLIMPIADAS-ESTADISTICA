<script setup lang="ts">
import StatusAlert from '@/shared/components/ui/molecules/StatusAlert.vue'

type AlertVariant = 'success' | 'info' | 'warning' | 'danger' | 'primary'

defineProps<{
  alerts: Array<{
    id: string | number
    variant?: AlertVariant
    statusCode?: number
    title?: string
    message?: string
    dismissible?: boolean
  }>
}>()
</script>

<template>
  <div class="grid w-full gap-4">
    <StatusAlert
      v-for="alert in alerts"
      :key="alert.id"
      :variant="alert.variant"
      :status-code="alert.statusCode"
      :title="alert.title"
      :message="alert.message"
      :dismissible="alert.dismissible"
    />
  </div>
</template>
