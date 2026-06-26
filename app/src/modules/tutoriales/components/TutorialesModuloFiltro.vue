<script setup lang="ts">
defineProps<{
  modulos: string[]
  moduloActivo: string
}>()

defineEmits<{
  (e: 'cambiarModulo', modulo: string): void
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="modulo in modulos"
      :key="modulo"
      type="button"
      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
      :class="
        moduloActivo === modulo
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white text-slate-500 border-gray-200 hover:border-primary/40 hover:text-primary hover:bg-gray-50'
      "
      @click="$emit('cambiarModulo', modulo)"
    >
      {{ modulo }}
    </button>
  </div>
</template>