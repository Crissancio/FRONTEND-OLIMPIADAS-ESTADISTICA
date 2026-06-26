<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'

const route = useRoute()
const logoOpeSrc = `${import.meta.env.BASE_URL}logo-ope.svg`
const isHomePage = computed(() => route.path === '/')
const isMobileMenuOpen = ref(false)
const showNavbar = ref(false)

const handleScroll = () => {
  showNavbar.value = window.scrollY > 100
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Acerca de', href: '/acerca' },
  { name: 'Convocatorias', href: '/convocatorias' },
  { name: 'Resultados', href: '/resultados' },
  { name: 'Material', href: '/material' },
  { name: 'Contacto', href: '/contacto' },
]

const toggleMobileMenu = () => { isMobileMenuOpen.value = !isMobileMenuOpen.value }
const closeMobileMenu = () => { isMobileMenuOpen.value = false }
</script>

<template>
  <header
    :class="[
      isHomePage ? 'fixed left-0 right-0' : 'sticky',
      'top-0 z-50 bg-white shadow-sm border-b border-gray-200 transition-transform duration-300 ease-in-out',
      (isHomePage && !showNavbar) ? '-translate-y-full' : 'translate-y-0'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <router-link to="/" class="flex items-center gap-3 group" @click="closeMobileMenu">
          <div class="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <img :src="logoOpeSrc" alt="Logo OPE" class="h-14 w-24 object-contain" />
          </div>
          <div class="flex flex-col">
            <span class="font-heading font-bold text-primary-dark leading-tight text-lg tracking-tight">
              OLIMPIADA PACEÑA DE ESTADÍSTICA
            </span>
            <span class="text-[11px] text-text-muted font-medium uppercase tracking-wider">
              Carrera de Estadística
            </span>
          </div>
        </router-link>

        <nav class="hidden lg:flex space-x-1 lg:space-x-4 items-center">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="text-sm font-semibold transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="route.path === item.href ? 'text-primary bg-info/10/50' : 'text-text-muted hover:text-primary hover:bg-gray-50'"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <div class="flex items-center lg:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-primary hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            @click="toggleMobileMenu"
          >
            <span class="sr-only">Open main menu</span>
            <component :is="isMobileMenuOpen ? X : Menu" class="block h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <div class="lg:hidden bg-white border-t border-gray-100" :class="isMobileMenuOpen ? 'block' : 'hidden'">
      <div class="px-4 pt-2 pb-4 space-y-1">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="block px-3 py-3 rounded-md text-base font-semibold transition-colors"
          :class="route.path === item.href ? 'text-primary bg-info/10' : 'text-text-main hover:text-primary hover:bg-gray-50'"
          @click="closeMobileMenu"
        >
          {{ item.name }}
        </router-link>
        <div class="pt-4 pb-2 border-t border-gray-100">
          <Button
            as="router-link"
            to="/inscripcion"
            variant="accent"
            size="default"
            class="w-full font-bold justify-center"
            @click="closeMobileMenu"
          >
            Inscripción Abierta
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>