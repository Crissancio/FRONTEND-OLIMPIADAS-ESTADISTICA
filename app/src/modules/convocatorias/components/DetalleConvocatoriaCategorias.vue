<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { Users, Calendar, Loader2 } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'

// Importación de los subcomponentes de las fases
import FasePreparacionPublicCard from '@/modules/fases/components/FasePreparacionPublicCard.vue'
import FasePruebaPublicCard from '@/modules/fases/components/FasePruebaPublicCard.vue'
import FasePruebaFinalPublicCard from '@/modules/fases/components/FasePruebaFinalPublicCard.vue'

const props = defineProps<{
  categorias: any[]
}>()

const activeTab = ref(0)
const isLoadingMaterials = ref(false)

const activeCategory = computed(() => props.categorias[activeTab.value] || null)

// Función para cambiar de tab con efecto de carga
const selectTab = (idx: number) => {
  if (activeTab.value === idx) return
  isLoadingMaterials.value = true
  activeTab.value = idx
  
  // Simulamos un pequeño delay de carga visual para la transición (o puedes quitar el timeout si tus props ya son reactivas al 100%)
  setTimeout(() => {
    isLoadingMaterials.value = false
  }, 400)
}

// Resuelve qué componente renderizar basado en la fase
const getPhaseComponent = (fase: any) => {
  if (fase.tipo === 'Preparación') return FasePreparacionPublicCard
  if (fase.tipo === 'Prueba') {
    return fase.es_prueba_final ? FasePruebaFinalPublicCard : FasePruebaPublicCard
  }
  return FasePreparacionPublicCard // Default fallback
}
</script>

<template>
  <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
    <div class="bg-gray-50 border-b border-gray-200 px-8 py-6">
      <h2 class="text-2xl font-heading font-bold text-text-main flex items-center gap-3">
        <Users class="w-6 h-6 text-primary" />
        Categorías Habilitadas
      </h2>
    </div>
    
    <div class="border-b border-gray-200 bg-white px-8">
      <div class="flex gap-4 overflow-x-auto pb-px scrollbar-hide pt-2">
        <button
          v-for="(cat, idx) in categorias"
          :key="cat.id"
          @click="selectTab(idx)"
          class="flex items-center gap-2 py-4 px-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 border-b-2 rounded-t-lg group"
          :class="activeTab === idx 
            ? 'border-primary text-primary bg-primary/5' 
            : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-50'"
        >
          <CategorySymbol :name="cat.nombre" class="h-6 w-6 shrink-0 transition-transform group-hover:scale-110" />
          
          <div 
            class="overflow-hidden transition-all duration-300 ease-in-out flex items-center"
            :class="activeTab === idx ? 'max-w-50 opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'"
          >
            <span class="truncate">{{ cat.nombre }}</span>
          </div>
        </button>
      </div>
    </div>
    
    <CardContent class="p-8 sm:p-10 bg-white min-h-100 relative">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-xl font-heading font-bold text-text-main flex items-center gap-2">
          <Calendar class="w-5 h-5 text-text-muted" />
          Cronograma de Fases
        </h3>
      </div>

      <div v-if="isLoadingMaterials" class="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity">
        <Loader2 class="w-10 h-10 text-primary animate-spin mb-3" />
        <p class="text-text-muted font-medium animate-pulse">Cargando cronograma y materiales...</p>
      </div>
      
      <Transition name="fade" mode="out-in">
        <div :key="activeTab" v-if="activeCategory?.fases && activeCategory.fases.length > 0" class="space-y-6">
          <component 
            v-for="fase in activeCategory.fases" 
            :key="fase.id"
            :is="getPhaseComponent(fase)" 
            :fase="fase" 
          />
        </div>

        <Card v-else class="text-center py-16 bg-gray-50 border-dashed border-gray-200">
          <CardContent class="p-0 flex flex-col items-center">
            <Calendar class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-text-muted text-lg font-medium">No hay fases programadas para esta categoría.</p>
          </CardContent>
        </Card>
      </Transition>
    </CardContent>
  </Card>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>