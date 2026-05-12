<script setup lang="ts">
import type { GreekLetterOption } from '@/shared/utils/greekLetters'

defineProps<{
  letter: GreekLetterOption
  selected?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="rounded-lg border bg-white p-3 text-center transition-all hover:border-accent hover:bg-accent/10"
    :class="selected ? 'border-accent bg-accent/10 shadow-sm' : 'border-gray-200'"
  >
    <span class="block font-heading text-2xl font-black text-primary">{{ letter.symbol }}</span>
    <span class="mt-1 block text-[11px] font-bold uppercase tracking-wide text-text-muted">{{ letter.name }}</span>
  </button>
</template>
