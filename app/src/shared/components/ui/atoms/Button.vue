<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'default' | 'accent' | 'outline' | 'ghost' | 'link' | 'primary'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  as?: string
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'default',
  as: 'button',
  disabled: false
})

const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'default':
      return 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary'
    case 'accent':
      return 'bg-accent text-primary hover:bg-accent-dark focus-visible:ring-accent'
    case 'outline':
      return 'border border-gray-200 bg-white text-text-main hover:bg-gray-50 focus-visible:ring-primary'
    case 'ghost':
      return 'bg-transparent hover:bg-gray-100 text-text-muted focus-visible:ring-primary'
    case 'link':
      return 'bg-transparent text-primary hover:text-primary-dark underline-offset-4 hover:underline p-0 h-auto focus-visible:ring-primary'
    default:
      return ''
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'lg':
      return 'px-8 py-3 text-lg'
    case 'icon':
      return 'p-2.5'
    default:
      return 'px-5 py-2.5 text-sm'
  }
})

const classes = computed(() => [baseClasses, variantClasses.value, sizeClasses.value])
</script>

<template>
  <component :is="as" :class="classes" :disabled="disabled">
    <slot />
  </component>
</template>
