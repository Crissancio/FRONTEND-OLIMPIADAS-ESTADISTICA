<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Mail, Plus, RefreshCw, Search, ShieldCheck, UserCog, UsersRound, Eye, EyeOff  } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import AdministradorManageDrawer from '@/modules/admin/components/AdministradorManageDrawer.vue'
import { AdministradoresService } from '@/modules/auth/services/administradores.service'
import type { AdministradorResponseDTO } from '@/modules/auth/types/auth.types'

const administradores = ref<AdministradorResponseDTO[]>([])
const isLoading = ref(false)
const actionLoading = ref(false)
const error = ref('')
const search = ref('')
const estadoFilter = ref<'todos' | 'activo' | 'inactivo'>('todos')
const isCreateOpen = ref(false)
const createForm = ref({ nombre: '', correo: '', contrasena: '' })
const selectedAdmin = ref<AdministradorResponseDTO | null>(null)
const isDrawerOpen = ref(false)

const sortedAdmins = computed(() => {
  const term = search.value.trim().toLowerCase()
  return [...administradores.value]
    .filter((admin) => {
      const matchesSearch = !term || admin.nombre.toLowerCase().includes(term) || admin.correo.toLowerCase().includes(term)
      const matchesEstado = estadoFilter.value === 'todos' || admin.estado.toLowerCase() === estadoFilter.value
      return matchesSearch && matchesEstado
    })
    .sort((a, b) => b.id_administrador - a.id_administrador)
})

const initials = (name: string) => {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'AD'
}

const statusClass = (estado: string) => {
  return estado.toUpperCase() === 'ACTIVO'
    ? 'border-success/20 bg-success/10 text-success'
    : 'border-warning/20 bg-warning/10 text-warning'
}

const loadAdmins = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await AdministradoresService.list({ page: 1, limit: 100 })
    administradores.value = res.data.items
  } catch {
    error.value = 'No se pudieron cargar los administradores.'
  } finally {
    isLoading.value = false
  }
}

const openAdmin = (admin: AdministradorResponseDTO) => {
  selectedAdmin.value = admin
  isDrawerOpen.value = true
}

const replaceAdmin = (admin: AdministradorResponseDTO) => {
  administradores.value = administradores.value.map((item) => item.id_administrador === admin.id_administrador ? admin : item)
  selectedAdmin.value = admin
}

const saveAdmin = async (payload: { id: number; nombre: string; correo: string }) => {
  actionLoading.value = true
  try {
    const res = await AdministradoresService.update(payload.id, {
      nombre: payload.nombre.trim(),
      correo: payload.correo.trim(),
    })
    replaceAdmin(res.data)
  } finally {
    actionLoading.value = false
  }
}

const bajaAdmin = async (id: number) => {
  actionLoading.value = true
  try {
    const res = await AdministradoresService.baja(id)
    replaceAdmin(res.data)
  } finally {
    actionLoading.value = false
  }
}

const altaAdmin = async (id: number) => {
  actionLoading.value = true
  try {
    const res = await AdministradoresService.alta(id)
    replaceAdmin(res.data)
  } finally {
    actionLoading.value = false
  }
}

const deleteAdmin = async (id: number) => {
  actionLoading.value = true
  try {
    await AdministradoresService.remove(id)
    administradores.value = administradores.value.filter((item) => item.id_administrador !== id)
    isDrawerOpen.value = false
    selectedAdmin.value = null
  } finally {
    actionLoading.value = false
  }
}

const createAdmin = async () => {
  if (!createForm.value.nombre.trim() || !createForm.value.correo.trim() || !createForm.value.contrasena.trim()) return
  actionLoading.value = true
  try {
    const res = await AdministradoresService.create({
      nombre: createForm.value.nombre.trim(),
      correo: createForm.value.correo.trim(),
      contrasena: createForm.value.contrasena,
    })
    administradores.value = [res.data, ...administradores.value]
    createForm.value = { nombre: '', correo: '', contrasena: '' }
    isCreateOpen.value = false
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadAdmins)

const showPassword = ref(false)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Administradores</h1>
        <p class="mt-1 text-sm text-text-muted">Panel de administración de usuarios administradores.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" class="flex items-center gap-2" :disabled="isLoading" @click="loadAdmins">
          <RefreshCw class="h-4 w-4" :class="isLoading ? 'animate-spin' : ''" />
          Recargar
        </Button>
        <Button variant="accent" class="flex items-center gap-2" @click="isCreateOpen = !isCreateOpen">
          <Plus class="h-4 w-4" />
          Crear admin
        </Button>
      </div>
    </div>

    <Card class="border-gray-200 bg-white shadow-soft">
      <CardContent class="space-y-4 p-4">
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div class="relative">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="search" class="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-9 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Filtrar por nombre o correo..." />
          </div>
          <select v-model="estadoFilter" class="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-text-main transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <form v-if="isCreateOpen" class="grid grid-cols-1 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 lg:grid-cols-4" @submit.prevent="createAdmin">
          <input v-model="createForm.nombre" class="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Nombre completo" />
          <input v-model="createForm.correo" type="email" class="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Correo" />
          <div class="relative">
            <input
              v-model="createForm.contrasena"
              :type="showPassword ? 'text' : 'password'"
              class="h-11 w-full rounded-md border border-gray-300 bg-white pr-10 pl-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Contraseña"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-primary"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <Button type="submit" variant="accent" class="h-11 justify-center" :disabled="actionLoading">
            {{ actionLoading ? 'Creando...' : 'Crear admin' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card class="border-gray-200 border-l-4 border-l-accent bg-white shadow-soft">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-accent/15 p-2.5">
              <UsersRound class="h-5 w-5 text-accent" />
            </div>
            <div>
              <p class="text-2xl font-bold text-text-main">{{ administradores.length }}</p>
              <p class="text-xs text-text-muted">Administradores</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="border-gray-200 border-l-4 border-l-primary bg-white shadow-soft">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-2.5">
              <ShieldCheck class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-2xl font-bold text-text-main">{{ administradores.filter((item) => item.estado.toUpperCase() === 'ACTIVO').length }}</p>
              <p class="text-xs text-text-muted">Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="error" class="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger">
      {{ error }}
    </div>

    <div v-if="isLoading" class="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-text-muted shadow-soft">
      Cargando administradores...
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="admin in sortedAdmins"
        :key="admin.id_administrador"
        type="button"
        class="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        @click="openAdmin(admin)"
      >
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            {{ initials(admin.nombre) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="truncate font-heading text-lg font-bold text-text-main">{{ admin.nombre }}</p>
              <Badge variant="outline" :class="`border px-2 py-0.5 ${statusClass(admin.estado)}`">{{ admin.estado }}</Badge>
            </div>
            <p class="mt-2 flex items-center gap-1.5 truncate text-sm text-text-muted">
              <Mail class="h-4 w-4 text-text-muted" />
              {{ admin.correo }}
            </p>
            <p class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              <UserCog class="h-4 w-4" />
              Administrar
            </p>
          </div>
        </div>
      </button>
    </div>

    <AdministradorManageDrawer
      v-model:open="isDrawerOpen"
      :admin="selectedAdmin"
      :loading="actionLoading"
      @save="saveAdmin"
      @alta="altaAdmin"
      @baja="bajaAdmin"
      @delete="deleteAdmin"
    />
  </div>
</template>
