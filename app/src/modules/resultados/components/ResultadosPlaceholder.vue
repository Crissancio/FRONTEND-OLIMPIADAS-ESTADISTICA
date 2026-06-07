<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
</script>

<template>
  <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
    <CardContent class="py-16 text-center">
      <Trophy class="mx-auto mb-3 h-10 w-10 text-gray-300" />
      <p class="font-bold text-text-main">Resultados y Clasificación</p>
      <p class="text-sm text-text-muted mt-1">Sección preparada para publicar resultados por fase.</p>
    </CardContent>
  </Card>
</template>