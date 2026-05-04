<script setup lang="ts">
type CardProps = {
  class?: string
}

const props = defineProps<CardProps>()
</script>

<template>
  <div :class="['rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden', props.class]">
    <slot />
  </div>
</template>
