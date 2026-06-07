<script setup lang="ts">
type CardContentProps = {
  class?: string | string[] | Record<string, boolean>
}

const props = defineProps<CardContentProps>()
</script>

<template>
  <div :class="['p-6', props.class]">
    <slot />
  </div>
</template>
