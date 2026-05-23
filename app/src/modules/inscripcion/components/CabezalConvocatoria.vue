<template>
  <div class="w-full bg-white border-b border-gray-100 px-4 py-6 sm:px-8 sm:py-8 text-center relative">
    
    <div class="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>

    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      Convocatoria Activa
    </div>

    <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
      {{ titulo }}
    </h1>

    <p class="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
      Completa el formulario a continuación para registrarte oficialmente.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
}>()
</script>