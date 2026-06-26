<script setup lang="ts">
import TutorialesTarjeta from './TutorialesTarjeta.vue'
import type { Tutorial } from '../data/tutoriales.data'

defineProps<{
  tutoriales: Tutorial[]
  tutorialActivo: Tutorial | null
}>()

defineEmits<{
  (e: 'seleccionar', tutorial: Tutorial): void
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <p
      v-if="tutoriales.length === 0"
      class="py-8 text-center text-sm font-medium text-slate-400"
    >
      No hay tutoriales en este módulo.
    </p>
    <TutorialesTarjeta
      v-for="tutorial in tutoriales"
      :key="tutorial.id"
      :tutorial="tutorial"
      :activo="tutorialActivo?.id === tutorial.id"
      @seleccionar="$emit('seleccionar', tutorial)"
    />
  </div>
</template>