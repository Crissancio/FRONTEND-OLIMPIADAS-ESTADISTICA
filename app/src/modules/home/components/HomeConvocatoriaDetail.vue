<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import type { HomeConvocatoria } from '../types/home.types'

import HomeConvocatoriaDocs from './HomeConvocatoriaDocs.vue'
import HomeConvocatoriaInfo from './HomeConvocatoriaInfo.vue'

const props = defineProps<{
  activeConv: HomeConvocatoria
}>()
</script>

<template>
  <div class="space-y-8 w-full max-w-7xl mx-auto">
    <div class="flex items-center gap-3 border-b border-gray-200 pb-4 justify-center md:justify-start">
      <BookOpen class="w-6 h-6 text-primary" />
      <h2 class="text-2xl font-heading font-bold text-text-main">Detalles de la Convocatoria</h2>
    </div>
    
    <Card class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <CardContent class="p-0">
        <div class="flex flex-col lg:flex-row">
          <HomeConvocatoriaDocs class="order-2 lg:order-1 lg:w-[45%]" :activeConv="props.activeConv" />
          
          <HomeConvocatoriaInfo class="order-1 lg:order-2 lg:w-[55%]" :activeConv="props.activeConv" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>