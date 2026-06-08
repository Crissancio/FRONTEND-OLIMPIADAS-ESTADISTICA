<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/app/stores/auth.store'
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Building2, 
  Users, 
  Bell, 
  Mail,
  Shield,
  UsersRound, 
  BarChart4, 
  LogOut,
  Menu,
  X
} from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import AdminProfileDrawer from '@/modules/auth/components/AdminProfileDrawer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const isSidebarOpen = ref(false)
const isProfileDrawerOpen = ref(false)
const logoOpeSrc = `${import.meta.env.BASE_URL}logo-ope.svg`
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Convocatorias', href: '/admin/convocatorias', icon: FileText },
  { name: 'Material', href: '/admin/material', icon: BookOpen },
  { name: 'Colegios', href: '/admin/colegios', icon: Building2 },
  { name: 'Estudiantes', href: '/admin/estudiantes', icon: Users },
  { name: 'Avisos', href: '/admin/avisos', icon: Bell },
  { name: 'Contactos', href: '/admin/contactos', icon: Mail },
  { name: 'Colaboradores', href: '/admin/colaboradores', icon: UsersRound },
  { name: 'Administradores', href: '/admin/administradores', icon: Shield },
  { name: 'Auditoría', href: '/admin/auditoria', icon: BarChart4 },
]

const adminInitials = computed(() => {
  const name = user.value?.nombre?.trim()
  if (!name) return 'AD'
  const parts = name.split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
})

const adminName = computed(() => user.value?.nombre || 'Administrador')
const adminEmail = computed(() => user.value?.correo || 'Sin correo')

const handleLogout = async () => {
  isSidebarOpen.value = false
  await authStore.logout()
  await router.push('/')
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.replace('/admin/login')
    return
  }

  if (!user.value) {
    try {
      await authStore.fetchCurrentUser()
    } catch {
      router.replace('/admin/login')
    }
  }
})

</script>

<template>
  <div v-if="isAuthenticated" class="flex h-screen bg-background font-sans overflow-hidden z-50">
   
    <!-- Sidebar -->
    <aside 
      class="hidden w-64 flex-col border-r border-primary/20 bg-primary-dark text-white lg:static lg:flex"
    >
      <div class="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div class="mr-3 flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden">
          <img :src="logoOpeSrc" alt="Logo OPE" class="h-11 w-16 object-contain" />
        </div>
        <span class="font-heading font-bold text-lg tracking-tight">Admin OPE</span>
        <Button 
          variant="ghost" 
          size="sm"
          class="ml-auto lg:hidden text-white/80 hover:text-white hover:bg-white/10"
          @click="isSidebarOpen = false"
        >
          <X class="w-5 h-5" />
        </Button>
      </div>
      
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <template v-for="item in navigation" :key="item.name">
          <router-link 
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors border border-transparent"
            :class="route.path === item.href || (item.href !== '/admin' && route.path.startsWith(item.href)) 
              ? 'bg-primary border-white/10 text-white shadow-sm' 
              : 'text-blue-100/80 hover:text-white hover:bg-white/5'"
            @click="isSidebarOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5" :class="route.path === item.href || (item.href !== '/admin' && route.path.startsWith(item.href)) ? 'text-secondary' : 'text-blue-100/60'" />
            {{ item.name }}
          </router-link>
        </template>
      </nav>
      
      <div class="p-4 border-t border-white/10">
        <button 
          @click="handleLogout"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md font-semibold text-sm text-blue-100/80 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut class="w-5 h-5 text-danger" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="relative z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            class="text-text-muted hover:text-text-main -ml-2 lg:hidden"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            <component :is="isSidebarOpen ? X : Menu" class="h-6 w-6" />
          </Button>
          <div
            v-if="isSidebarOpen"
            class="absolute left-4 right-4 top-[calc(100%+0.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft lg:hidden"
          >
            <nav class="max-h-[70vh] overflow-y-auto p-2">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors"
                :class="route.path === item.href || (item.href !== '/admin' && route.path.startsWith(item.href))
                  ? 'bg-primary text-white'
                  : 'text-text-main hover:bg-gray-50 hover:text-primary'"
                @click="isSidebarOpen = false"
              >
                <component :is="item.icon" class="h-5 w-5" :class="route.path === item.href || (item.href !== '/admin' && route.path.startsWith(item.href)) ? 'text-secondary' : 'text-text-muted'" />
                {{ item.name }}
              </router-link>
              <button
                class="mt-2 flex w-full items-center gap-3 rounded-lg border-t border-gray-100 px-3 py-3 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
                @click="handleLogout"
              >
                <LogOut class="h-5 w-5" />
                Cerrar Sesión
              </button>
            </nav>
          </div>

        </div>
      
        <div class="flex items-center gap-4 sm:gap-6">
          <button class="flex items-center gap-3 rounded-lg border border-transparent py-1.5 pl-4 pr-2 text-left transition-all hover:border-primary/20 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" @click="isProfileDrawerOpen = true">
            <div class="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {{ adminInitials }}
            </div>
            <div class="hidden sm:flex flex-col">
              <span class="text-sm font-bold text-text-main">{{ adminName }}</span>
              <span class="text-xs font-semibold text-text-muted">{{ adminEmail }}</span>
            </div>
          </button>
        </div>
      </header>
    
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
        <router-view v-slot="{ Component, route }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
    <AdminProfileDrawer v-model:open="isProfileDrawerOpen" :user="user" />
  </div>
</template>
