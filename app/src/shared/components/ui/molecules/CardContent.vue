<script setup lang="ts">
type CardContentProps = {
  class?: string
}

const props = defineProps<CardContentProps>()
</script>

<template>
  <div :class="['p-6', props.class]">
    <slot />
  </div>
</template>
