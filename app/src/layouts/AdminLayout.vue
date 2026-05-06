<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Building2, 
  Users, 
  Bell, 
  UsersRound, 
  BarChart4, 
  LogOut,
  Menu,
  X
} from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(false)
const isAuthenticated = ref(false)
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Convocatorias', href: '/admin/convocatorias', icon: FileText },
  { name: 'Material', href: '/admin/material', icon: BookOpen },
  { name: 'Colegios', href: '/admin/colegios', icon: Building2 },
  { name: 'Estudiantes', href: '/admin/estudiantes', icon: Users },
  { name: 'Avisos', href: '/admin/avisos', icon: Bell },
  { name: 'Colaboradores', href: '/admin/colaboradores', icon: UsersRound },
  { name: 'Auditoría', href: '/admin/auditoria', icon: BarChart4 },
]

const handleLogout = () => {
  sessionStorage.removeItem('adminAuth')
  router.push('/admin/login')
}

onMounted(() => {
  isAuthenticated.value = sessionStorage.getItem('adminAuth') === 'true'
  if (!isAuthenticated.value) {
    router.replace('/admin/login')
  }
})

</script>

<template>
  <div v-if="isAuthenticated" class="flex h-screen bg-background font-sans overflow-hidden">
   
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isSidebarOpen = false"
    ></div>
    
    <!-- Sidebar -->
    <aside 
      :class="`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary-dark text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-primary/20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`"
    >
      <div class="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div class="w-8 h-8 rounded bg-secondary flex items-center justify-center mr-3 shadow-sm">
          <BarChart4 class="w-5 h-5 text-white" />
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
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 shadow-sm">
        <div class="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            class="text-text-muted hover:text-text-main -ml-2 lg:hidden"
            @click="isSidebarOpen = true"
          >
            <Menu class="w-6 h-6" />
          </Button>
        
          <!--div class="hidden sm:flex relative w-64 xl:w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar (ej. CI, nombre)..." 
              class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-gray-50 transition-all"
            />
          </div-->
        </div>
      
        <div class="flex items-center gap-4 sm:gap-6">
          <button class="relative text-text-muted hover:text-primary transition-colors">
            <Bell class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-white bg-accent rounded-full"></span>
          </button>
        
          <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              AS
            </div>
            <div class="hidden sm:flex flex-col">
              <span class="text-sm font-bold text-text-main">Admin System</span>
              <span class="text-xs font-semibold text-text-muted">Super Administrador</span>
            </div>
          </div>
        </div>
      </header>
    
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
        <router-view />
      </main>
    </div>
  </div>
</template>
