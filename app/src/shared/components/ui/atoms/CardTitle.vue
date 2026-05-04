<script setup lang="ts">
type CardTitleProps = {
  class?: string
}

const props = defineProps<CardTitleProps>()
</script>

<template>
  <h3 :class="['text-base font-heading font-semibold text-text-main', props.class]">
    <slot />
  </h3>
</template>
