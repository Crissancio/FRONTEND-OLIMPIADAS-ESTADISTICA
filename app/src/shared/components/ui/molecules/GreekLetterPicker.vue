<script setup lang="ts">
import { ref } from 'vue'
import GreekLetterTile from '@/shared/components/ui/atoms/GreekLetterTile.vue'
import {
  greekLowercaseOptions,
  greekUppercaseOptions,
  type GreekLetterOption,
} from '@/shared/utils/greekLetters'

const model = defineModel<string>({ required: true })
const activeCase = ref<'uppercase' | 'lowercase'>('uppercase')

const selectLetter = (letter: GreekLetterOption) => {
  model.value = letter.name
}
</script>

<template>
  <div class="space-y-3">
    <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      <button
        type="button"
        class="rounded-md px-3 py-2 text-sm font-bold transition-colors"
        :class="activeCase === 'uppercase' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-white hover:text-primary'"
        @click="activeCase = 'uppercase'"
      >
        Mayúsculas
      </button>
      <button
        type="button"
        class="rounded-md px-3 py-2 text-sm font-bold transition-colors"
        :class="activeCase === 'lowercase' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-white hover:text-primary'"
        @click="activeCase = 'lowercase'"
      >
        Minúsculas
      </button>
    </div>

    <div class="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-4 md:grid-cols-6">
      <GreekLetterTile
        v-for="letter in activeCase === 'uppercase' ? greekUppercaseOptions : greekLowercaseOptions"
        :key="letter.name"
        :letter="letter"
        :selected="model === letter.name"
        @click="selectLetter(letter)"
      />
    </div>
  </div>
</template>
