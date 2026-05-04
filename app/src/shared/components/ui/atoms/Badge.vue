<script setup lang="ts">
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

const props = withDefaults(defineProps<{
  variant?: BadgeVariant
}>(), {
  variant: 'default'
})

const variantClasses = {
  default: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-gray-100 text-text-main hover:bg-gray-200',
  outline: 'bg-transparent border border-gray-200 text-text-main hover:bg-gray-50',
  destructive: 'bg-red-500 text-white hover:bg-red-600'
}
</script>

<template>
  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider', variantClasses[variant]]">
    <slot />
  </span>
</template>
