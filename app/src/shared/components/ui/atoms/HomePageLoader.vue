<script setup lang="ts">
</script>

<template>
  <div class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-primary gap-6">

    <div class="flex items-end gap-0.75 h-12">
      <div
        v-for="i in 9"
        :key="i"
        class="loader-bar rounded-sm bg-secondary/80"
        :style="{
          '--delay': `${(i - 1) * 60}ms`,
          width: '6px',
        }"
      />
    </div>

    <p class="text-white/60 text-xs font-semibold tracking-[0.25em] uppercase animate-pulse">
      Cargando...
    </p>
  </div>
</template>

<style scoped>
.loader-bar {
  animation: gauss 1.4s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes gauss {
  0%   { height: 6px;  opacity: 0.3; }
  25%  { height: 40px; opacity: 1;   }
  50%  { height: 6px;  opacity: 0.3; }
  75%  { height: 40px; opacity: 1;   }
  100% { height: 6px;  opacity: 0.3; }
}
</style>