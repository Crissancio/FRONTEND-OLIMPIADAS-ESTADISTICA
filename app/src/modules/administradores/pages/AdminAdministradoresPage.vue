<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Plus, RefreshCw, Search, ShieldCheck, UsersRound, Eye, EyeOff, Loader2, AlertTriangle, X } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import AdministradorManageDrawer from '@/modules/administradores/components/AdministradorManageDrawer.vue'
import AdministradorCard from '@/modules/administradores/components/AdministradorCard.vue'
import { administradoresService } from '@/modules/administradores/services/administradores.service'
import { useAdministradorStore } from '@/modules/administradores/stores/administradores.store'
import { useAuthStore } from '@/app/stores/auth.store'
import type { AdministradorDTO } from '@/modules/administradores/types/administradores.api'

const store = useAdministradorStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const isActionLoading = ref(false)
const search = ref('')
const estadoFilter = ref<'todos' | 'activo' | 'inactivo'>('todos')

const isCreateOpen = ref(false)
const showPassword = ref(false)
const createForm = ref({ nombre: '', correo: '', contrasena: '' })

const isDrawerOpen = ref(false)
const selectedAdminId = ref<number | null>(null)

const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const currentPage = ref(1)
const hasMoreData = ref(true)

const errorMessage = ref('')
let errorTimeout: ReturnType<typeof setTimeout>

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null

  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    clearTimeout(errorTimeout)
    errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
    return
  }

  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
  clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const clearError = () => {
  errorMessage.value = ''
  clearTimeout(errorTimeout)
}

const handleChildError = (err: any) => {
  extractError(err, 'Ocurrió un problema en la operación seleccionada.')
}

const loadData = async (reset = false) => {
  if (reset) {
    currentPage.value = 1
    hasMoreData.value = true
    store.clearStore()
  }

  if (!hasMoreData.value || isLoading.value) return

  isLoading.value = true
  clearError()

  try {
    const res = await administradoresService.listarAdministradores({
      page: currentPage.value,
      limit: 20,
      nombre: search.value.trim() || null,
      correo: search.value.trim() || null
    })

    if (res.success && res.data) {
      if (reset) {
        store.setAdministradores(res.data.items)
      } else {
        store.appendAdministradores(res.data.items)
      }
      store.setMeta(res.data.meta)
      
      if (currentPage.value >= res.data.meta.total_pages) {
        hasMoreData.value = false
      } else {
        currentPage.value++
      }
    }
  } catch (err) {
    extractError(err, 'No se pudieron cargar los administradores.')
  } finally {
    isLoading.value = false
  }
}

let timeoutId: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => loadData(true), 500)
})

const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMoreData.value && !isLoading.value) {
      loadData()
    }
  }, { rootMargin: '100px' })
  if (observerTarget.value) observer.observe(observerTarget.value)
}

onMounted(() => {
  loadData(true)
  setupObserver()
})

onUnmounted(() => {
  if (observer && observerTarget.value) observer.unobserve(observerTarget.value)
  store.clearStore()
})

const sortedAndFilteredAdmins = computed(() => {
  return store.administradores.filter((admin) => {
    if (estadoFilter.value === 'todos') return true
    return admin.estado.toLowerCase() === estadoFilter.value
  }).sort((a, b) => b.id_administrador - a.id_administrador)
})

const openAdmin = (admin: AdministradorDTO) => {
  selectedAdminId.value = admin.id_administrador
  isDrawerOpen.value = true
}

const syncAuthIfMatched = (admin: AdministradorDTO) => {
  if (authStore.user?.id_administrador === admin.id_administrador) {
    authStore.user = { ...authStore.user, ...admin }
  }
}

const onAdminUpdated = (admin: AdministradorDTO) => {
  store.updateAdministrador(admin)
  syncAuthIfMatched(admin)
}

const onAdminDeleted = (id: number) => {
  store.removeAdministrador(id)
}

const createAdmin = async () => {
  if (!createForm.value.nombre.trim() || !createForm.value.correo.trim() || !createForm.value.contrasena.trim()) return
  isActionLoading.value = true
  clearError()
  try {
    const res = await administradoresService.crearAdministrador({
      nombre: createForm.value.nombre.trim(),
      correo: createForm.value.correo.trim(),
      contrasena: createForm.value.contrasena,
    })
    if (res.success && res.data) {
      store.administradores.unshift(res.data)
      createForm.value = { nombre: '', correo: '', contrasena: '' }
      isCreateOpen.value = false
    }
  } catch (err) {
    extractError(err, 'No se pudo crear el administrador.')
  } finally {
    isActionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 relative">
    
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

    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-gray-900 tracking-tight">Administradores</h1>
        <p class="mt-1 text-sm text-gray-500 font-medium">Panel de control del personal administrativo del sistema.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" class="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50" :disabled="isLoading" @click="loadData(true)">
          <RefreshCw class="h-4 w-4" :class="isLoading ? 'animate-spin' : ''" />
          Recargar
        </Button>
        <Button variant="accent" class="flex items-center gap-2" @click="isCreateOpen = !isCreateOpen">
          <Plus class="h-4 w-4" />
          Crear admin
        </Button>
      </div>
    </div>

    <Card class="border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden">
      <CardContent class="space-y-4 p-4">
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div class="relative">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
            <input v-model="search" class="h-11 w-full rounded-md border border-gray-300 bg-gray-50 pl-9 pr-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-800" placeholder="Buscar administrador por nombre o correo electrónico..." />
          </div>
          <select v-model="estadoFilter" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
            <option value="todos">Todos los estados</option>
            <option value="activo">Solo Activos</option>
            <option value="inactivo">Solo Inactivos</option>
          </select>
        </div>

        <form v-if="isCreateOpen" class="grid grid-cols-1 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 lg:grid-cols-4 animate-fade-in" @submit.prevent="createAdmin">
          <input v-model="createForm.nombre" required class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Nombre completo" />
          <input v-model="createForm.correo" type="email" required class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Correo electrónico" />
          <div class="relative">
            <input
              v-model="createForm.contrasena"
              required
              :type="showPassword ? 'text' : 'password'"
              class="h-11 w-full rounded-md border border-gray-300 bg-white pr-10 pl-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contraseña"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <Button type="submit" variant="accent" class="h-11 w-full justify-center disabled:opacity-50" :disabled="isActionLoading">
            <Loader2 v-if="isActionLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isActionLoading ? 'Creando...' : 'Crear Administrador' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card class="border-gray-200 border-l-4 border-l-accent bg-white shadow-sm rounded-xl overflow-hidden">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-accent/10 p-2.5">
              <UsersRound class="h-6 w-6 text-accent" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 leading-none">{{ store.meta.total }}</p>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Registrados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="border-gray-200 border-l-4 border-l-emerald-500 bg-white shadow-sm rounded-xl overflow-hidden">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-emerald-50 p-2.5">
              <ShieldCheck class="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 leading-none">{{ store.administradores.filter((item) => item.estado.toUpperCase() === 'ACTIVO').length }}</p>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Cuentas Activas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="store.administradores.length === 0 && !isLoading" class="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center">
      <p class="text-lg font-medium text-gray-900">No se encontraron administradores</p>
      <p class="text-sm text-gray-500 mt-1">Intenta ajustando los filtros de búsqueda.</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AdministradorCard 
        v-for="admin in sortedAndFilteredAdmins" 
        :key="admin.id_administrador" 
        :admin="admin"
        @click="openAdmin"
      />
    </div>

    <div ref="observerTarget" class="flex h-20 w-full items-center justify-center">
      <Loader2 v-if="isLoading" class="h-6 w-6 animate-spin text-primary" />
    </div>

    <AdministradorManageDrawer
      :is-open="isDrawerOpen"
      :admin-id="selectedAdminId"
      @close="isDrawerOpen = false"
      @updated="onAdminUpdated"
      @deleted="onAdminDeleted"
      @error="handleChildError"
    />
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
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>