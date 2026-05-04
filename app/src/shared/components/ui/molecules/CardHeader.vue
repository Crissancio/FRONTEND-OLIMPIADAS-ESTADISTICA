<script setup lang="ts">
type CardHeaderProps = {
  class?: string
}

const props = defineProps<CardHeaderProps>()
</script>

<template>
  <div :class="['p-6', props.class]">
    <slot />
  </div>
</template>
