<script setup lang="ts">
import { PlayCircle, Clock } from 'lucide-vue-next'
import type { Tutorial } from '../data/tutoriales.data'

defineProps<{
  tutorial: Tutorial
  activo: boolean
}>()

defineEmits<{
  (e: 'seleccionar'): void
}>()
</script>

<template>
  <button
    type="button"
    class="w-full text-left rounded-lg border p-3 transition-all cursor-pointer group"
    :class="
      activo
        ? 'border-primary bg-primary/5 shadow-sm'
        : 'border-gray-200 bg-white hover:border-primary/30 hover:bg-gray-50/70'
    "
    @click="$emit('seleccionar')"
  >
    <div class="flex items-start gap-3">
      <div
        class="mt-0.5 shrink-0 rounded-full p-1.5 transition-colors"
        :class="
          activo
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
        "
      >
        <PlayCircle class="size-3.5" />
      </div>
      <div class="min-w-0 flex-1">
        <p
          class="text-xs font-bold leading-snug"
          :class="activo ? 'text-primary' : 'text-slate-800'"
        >
          {{ tutorial.title }}
        </p>
        <p class="mt-0.5 text-[11px] text-slate-400 font-medium truncate">{{ tutorial.module }}</p>
        <div
          v-if="tutorial.duration !== '00:00'"
          class="mt-1 flex items-center gap-1 text-[11px] text-slate-400"
        >
          <Clock class="size-3" />
          <span>{{ tutorial.duration }}</span>
        </div>
      </div>
    </div>
  </button>
</template>