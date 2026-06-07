<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Plus, Settings, AlertCircle, X } from 'lucide-vue-next'
import { useCategoriasStore } from '../stores/categorias.store'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'

import CategoriaModal from './CategoriaModal.vue'

const props = defineProps<{ convocatoriaId: number }>()
const categoriasStore = useCategoriasStore()
const router = useRouter()

const localError = ref<string | null>(null)
const modalRef = ref<InstanceType<typeof CategoriaModal> | null>(null)

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)

  const responseData =
    err?.response?.data ??
    err?.data ??
    err?.details ??
    null

  if (responseData) {
    localError.value =
      responseData.error ||
      responseData.message ||
      responseData.detail ||
      fallbackMsg

    return
  }

  localError.value =
    err?.message && !err.message.includes('status code')
      ? err.message
      : fallbackMsg
}

onMounted(async () => {
  localError.value = null
  try {
    await categoriasStore.fetchCategorias(props.convocatoriaId)
  } catch (error) {
    extractError(error, 'Ocurrió un error al obtener las categorías')
  }
})

function openCreateCategoryModal() {
  if (modalRef.value) {
    modalRef.value.openCreate()
  }
}

function goToManageCategory(categoriaId: number) {
  router.push(`/admin/convocatoria/${props.convocatoriaId}/categoria/${categoriaId}/gestionar`)
}

// Mapeo directo a los variants del Badge (default, secondary, outline, destructive, success, not_allowed)
const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'BORRADOR': 
      return 'secondary'
    case 'LISTA': 
      return 'success'
    case 'ELIMINADA': 
      return 'destructive'
    default: 
      return 'outline'
  }
}

defineExpose({
  openCreateCategoryModal
})
</script>

<template>
  <Card class="border-gray-200 shadow-soft bg-white">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <BookOpen class="h-5 w-5 text-primary" />
            Categorías Habilitadas
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">Configuración de niveles y grados de competencia.</p>
        </div>
        <Button variant="accent" class="flex items-center gap-2 h-9 text-xs px-3" @click="openCreateCategoryModal">
          <Plus class="h-3.5 w-3.5" />
          Nueva Categoría
        </Button>
      </div>
    </CardHeader>
    
    <CardContent class="pt-6">
      
      <div v-if="categoriasStore.loading" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted text-center animate-pulse">
        Sincronizando categorías...
      </div>
      
      <template v-else>
        <transition name="slide">
          <div v-if="localError" class="mb-5 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3 shadow-sm shrink-0">
            <AlertCircle class="h-4 w-4 text-danger shrink-0 mt-0.5 " />
            <div class="flex-1 min-w-0">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-danger">Error</h4>
              <p class="text-xs font-medium wrap-break-word whitespace-pre-wrap text-danger">{{ localError }}</p>
            </div>
            <button @click="localError = null" class="text-danger/60 hover:text-danger-hover transition-colors shrink-0">
              <X class="h-3 w-3 text-danger" />
            </button>
          </div>
        </transition>
        
        <div v-if="categoriasStore.categorias.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <BookOpen class="mx-auto h-8 w-8 text-gray-300" />
          <h3 class="mt-2 text-sm font-semibold text-text-main">Sin categorías</h3>
          <p class="mt-1 text-xs text-text-muted">Aún no se han definido categorías para esta convocatoria.</p>
          <Button variant="outline" size="sm" class="mt-4" @click="openCreateCategoryModal">
            <Plus class="mr-2 h-4 w-4" />Crear primera categoría
          </Button>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div 
            v-for="cat in categoriasStore.categorias" 
            :key="cat.id_categoria"
            class="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 shadow-inner">
                <CategorySymbol :name="cat.nombre_categoria" class="text-3xl text-primary font-heading" />
              </div>
              
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-lg text-text-main">{{ cat.nombre_categoria }}</h4>
                  <Badge :variant="getBadgeVariant(cat.estado)" class="text-[10px] font-semibold tracking-wide px-1.5 py-0">
                    {{ cat.estado }}
                  </Badge>
                </div>
                <div class="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="outline" class="text-[10px] px-2">
                    {{ cat.nivel }}
                  </Badge>
                  <Badge variant="outline" class="text-[10px] px-2">
                    {{ cat.curso }}º Curso
                  </Badge>
                </div>
              </div>
            </div>

            <div class="shrink-0 ml-4">
              <button 
                class="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30" 
                title="Administrar Categoría"
                @click="goToManageCategory(cat.id_categoria)"
              >
                <Settings class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </template>

    </CardContent>
  </Card>

  <CategoriaModal 
    ref="modalRef" 
    :convocatoria-id="convocatoriaId" 
    @refresh="categoriasStore.fetchCategorias(convocatoriaId)"
  />
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>