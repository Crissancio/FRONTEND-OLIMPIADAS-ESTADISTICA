<script setup lang="ts">
import { BookOpen, Download, Calendar, Users, ArrowRight } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'
import type { HomeConvocatoria } from '../types/home.types'

const props = defineProps<{
  activeConv: HomeConvocatoria
}>()
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto w-full">
    <div class="flex items-center gap-3 border-b border-gray-200 pb-4 justify-center md:justify-start">
      <BookOpen class="w-6 h-6 text-primary" />
      <h2 class="text-2xl font-heading font-bold text-text-main">Detalles de la Convocatoria</h2>
    </div>
    
    <Card class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <CardContent class="p-0">
        <div class="md:flex">
          <div class="md:w-1/3 bg-slate-50 relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <div class="w-full max-w-[200px] aspect-[3/4] bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center text-text-muted p-4 text-center rounded hover:border-primary transition-colors cursor-pointer group">
              <Download class="w-10 h-10 mb-3 text-secondary group-hover:text-primary transition-colors" />
              <span class="text-sm font-semibold text-text-main">Afiche Oficial PDF</span>
              <span class="text-xs mt-1">Descargar (2.4 MB)</span>
            </div>
            <Badge 
              v-if="props.activeConv.estado === 'ACTIVA'" 
              class="absolute top-4 left-4 bg-success text-white font-bold px-3 py-1 shadow-sm"
            >
              EN CURSO
            </Badge>
          </div>
          
          <div class="p-8 md:w-2/3 flex flex-col justify-between">
            <div>
              <h3 class="text-2xl font-heading font-bold text-primary-dark mb-3">
                {{ props.activeConv.nombre }}
              </h3>
              <p class="text-text-muted mb-6 text-sm leading-relaxed">
                {{ props.activeConv.descripcionBreve }}
              </p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div class="bg-background p-4 rounded-lg border border-gray-100">
                  <div class="flex items-center gap-2 mb-2">
                    <Calendar class="w-4 h-4 text-secondary" />
                    <h4 class="font-semibold text-sm text-text-main">Cronograma</h4>
                  </div>
                  <p class="text-sm text-text-muted">{{ props.activeConv.fechas }}</p>
                </div>
                
                <div class="bg-background p-4 rounded-lg border border-gray-100">
                  <div class="flex items-center gap-2 mb-2">
                    <Users class="w-4 h-4 text-secondary" />
                    <h4 class="font-semibold text-sm text-text-main">Categorías</h4>
                  </div>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    <span v-for="cat in props.activeConv.categorias" :key="cat.id" class="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-text-main px-2 py-1 rounded">
                      <CategorySymbol :name="cat.nombre" class="h-5 w-5 rounded text-[10px]" />
                      {{ cat.nombre }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                as="router-link"
                :to="`/convocatoria/${props.activeConv.id}`"
                variant="link"
                class="text-primary font-semibold hover:text-secondary group flex items-center"
              >
                Ver documento completo
                <ArrowRight class="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>