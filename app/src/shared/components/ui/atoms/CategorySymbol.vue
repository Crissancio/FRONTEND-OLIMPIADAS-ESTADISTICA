<script setup lang="ts">
import { computed } from 'vue'
import { getGreekUppercaseLetter } from '@/shared/utils/greekLetters'

const props = withDefaults(defineProps<{
  name: string
  class?: string
}>(), {
  class: '',
})

const symbol = computed(() => getGreekUppercaseLetter(props.name))
</script>

<template>
  <span
    :class="[
      'inline-flex shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-black text-primary',
      props.class,
    ]"
    :aria-label="`Categoría ${name}`"
  >
    {{ symbol }}
  </span>
</template>
