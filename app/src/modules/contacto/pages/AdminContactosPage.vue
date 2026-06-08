<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Inbox, CheckCheck, LoaderCircle, AlertTriangle, X } from 'lucide-vue-next'
import { contactoService } from '../services/contacto.service'
import ContactoFilters from '../components/ContactoFilters.vue'
import ContactoCard from '../components/ContactoCard.vue'
import ContactoDetail from '../components/ContactoDetail.vue'
import type { ContactoDTO, ContactoCompletoDTO } from '../types/contacto.api'

type TabMode = 'recientes' | 'respondidos'

const currentTab = ref<TabMode>('recientes')
const items = ref<(ContactoDTO | ContactoCompletoDTO)[]>([])
const loading = ref(false)
const selectedId = ref<number | null>(null)

const activeFilters = ref<Record<string, any>>({ page: 1, limit: 20 })
const totalItems = ref(0)

const errorMessage = ref('')
let errorTimeout: ReturnType<typeof setTimeout>

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)

  const responseData =
    err?.response?.data ??
    err?.data ??
    err?.details ??
    null

  if (responseData) {
    errorMessage.value =
      responseData.error ||
      responseData.message ||
      responseData.detail ||
      fallbackMsg
  } else {
    errorMessage.value =
      err?.message && !err.message.includes('status code')
        ? err.message
        : fallbackMsg
  }

  clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const clearError = () => {
  errorMessage.value = ''
  clearTimeout(errorTimeout)
}

const fetchLista = async () => {
  loading.value = true
  clearError()
  try {
    if (currentTab.value === 'recientes') {
      const res = await contactoService.listarContactos(activeFilters.value)
      if (res.success && res.data) {
        items.value = res.data.items
        totalItems.value = res.data.meta?.total || res.data.items.length
      }
    } else {
      const res = await contactoService.listarContactosRespondidos(activeFilters.value)
      if (res.success && res.data) {
        items.value = res.data.items
        totalItems.value = res.data.meta?.total || res.data.items.length
      }
    }
  } catch (error) {
    extractError(error, 'Ocurrió un problema al cargar los contactos.')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = (newFilters: Record<string, any>) => {
  activeFilters.value = { ...newFilters, limit: 20 }
  fetchLista()
}

const handleTabChange = (tab: TabMode) => {
  currentTab.value = tab
  selectedId.value = null
  items.value = []
  activeFilters.value = { page: 1, limit: 20 }
  fetchLista()
}

const handleChildError = (err: any) => {
  extractError(err, 'Ocurrió un problema en la operación seleccionada.')
}

onMounted(() => {
  fetchLista()
})
</script>

<template>
  <div class="flex h-[calc(100vh-6rem)] min-h-150 flex-col gap-4 relative">
    
    <transition name="toast-slide">
      <div v-if="errorMessage" class="fixed top-6 right-6 z-9999 flex w-full max-w-sm items-start gap-3 rounded-xl bg-red-600 p-4 text-white shadow-2xl">
        <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5 opacity-90" />
        <div class="flex-1">
          <h3 class="text-sm font-bold">Error en la operación</h3>
          <p class="mt-1 text-xs opacity-90">{{ errorMessage }}</p>
        </div>
        <button @click="clearError" class="shrink-0 rounded-md p-1 opacity-70 hover:bg-red-700 hover:opacity-100 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
    </transition>

    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center shrink-0">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Mensajes de contacto</h1>
        <p class="mt-0.5 text-xs text-gray-500 font-medium">Revisa las consultas entrantes de los usuarios y despacha respuestas institucionales.</p>
      </div>
      <div class="inline-flex rounded-lg bg-gray-100 p-1 shrink-0 self-start sm:self-auto">
        <button 
          @click="handleTabChange('recientes')"
          class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-all"
          :class="currentTab === 'recientes' ? 'text-white bg-primary shadow-xs' : 'text-gray-500 hover:text-gray-900'"
        >
          <Inbox class="w-3.5 h-3.5" />
          Mensajes Recientes
        </button>
        <button 
          @click="handleTabChange('respondidos')"
          class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-all"
          :class="currentTab === 'respondidos' ? 'text-white bg-accent shadow-xs' : 'text-gray-500 hover:text-gray-900'"
        >
          <CheckCheck class="w-3.5 h-3.5" />
          Respondidos
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden border border-gray-200 bg-white rounded-xl shadow-xs grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside class="flex min-h-0 flex-col border-gray-200 lg:border-r bg-white" :class="selectedId ? 'hidden lg:flex' : 'flex'">
        <ContactoFilters :mode="currentTab" @filterChange="handleFilterChange" />

        <div class="min-h-0 flex-1 overflow-y-auto divide-y divide-gray-100 relative">
          <div v-if="loading && items.length === 0" class="absolute inset-0 flex items-center justify-center p-4 bg-white/80 z-10">
            <LoaderCircle class="w-6 h-6 text-primary animate-spin" />
          </div>

          <ContactoCard 
            v-for="item in items" 
            :key="item.id_contacto" 
            :item="item" 
            :active="selectedId === item.id_contacto"
            :mode="currentTab"
            @select="(id) => selectedId = id"
          />

          <div v-if="items.length === 0 && !loading" class="p-8 text-center text-xs font-semibold text-gray-400">
            No se encontraron consultas asociadas con estos criterios de búsqueda.
          </div>
        </div>
        
        <div class="border-t border-gray-200 p-3 bg-gray-50 shrink-0 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          <span>Total registros</span>
          <span class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">{{ totalItems }}</span>
        </div>
      </aside>

      <section class="min-h-0 flex flex-col bg-white" :class="selectedId ? 'flex' : 'hidden lg:flex'">
        <ContactoDetail 
          :contactoId="selectedId" 
          @close="selectedId = null" 
          @mutated="fetchLista"
          @error="handleChildError"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>